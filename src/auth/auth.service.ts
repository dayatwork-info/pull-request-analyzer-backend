import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { DecryptCredentialsDto, DecryptedCredentialsResponseDto } from './dto/decrypt-credentials.dto';
import { User, UserDocument, RefreshToken } from './schemas/user.schema';
import { CryptoUtil } from './utils/crypto.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  
  // Helper methods for tokens and password management
  private async generateTokens(userId: string, email: string) {
    const accessTokenPayload = { sub: userId, email };
    const refreshTokenPayload = { sub: userId };
    
    const accessToken = this.jwtService.sign(accessTokenPayload);
    
    // Create refresh token with longer expiry
    const refreshTokenExpiry = this.configService.get<string>('app.auth.refreshTokenExpiresIn') || '7d';
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get<string>('app.auth.refreshTokenSecret'),
      expiresIn: refreshTokenExpiry,
    });
    
    return { accessToken, refreshToken };
  }
  
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  
  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  private getIpFromRequest(request: Request): string {
    return request.ip || 'unknown';
  }
  
  private async saveRefreshToken(userId: string, token: string, ipAddress: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Set token expiry date
    const refreshTokenExpiry = this.configService.get<string>('app.auth.refreshTokenExpiresIn') || '7d';
    const expiryDays = parseInt(refreshTokenExpiry.replace('d', ''), 10) || 7;
    const expires = new Date();
    expires.setDate(expires.getDate() + expiryDays);
    
    // Create refresh token record
    const refreshToken: RefreshToken = {
      token,
      expires,
      createdAt: new Date(),
      createdByIp: ipAddress,
      isActive: true,
    };
    
    // Add token to user's refresh tokens
    user.refreshTokens.push(refreshToken);
    await user.save();
  }

  async login(loginDto: LoginDto, request?: Request) {
    const { email, password } = loginDto;
    const ipAddress = request ? this.getIpFromRequest(request) : 'unknown';

    // Find user by email
    const user = await this.userModel.findOne({ email }).exec();
    
    // Check if user exists and password is correct
    if (user) {
      // If we're using bcrypt, we need to verify the password
      const passwordIsValid = await this.verifyPassword(password, user.password);
      
      // For backward compatibility, also check plain password
      const plainPasswordValid = user.password === password;
      
      if (passwordIsValid || plainPasswordValid) {
        // Generate JWT tokens
        const { accessToken, refreshToken } = await this.generateTokens(
          user._id.toString(),
          user.email,
        );
        
        // Save refresh token
        await this.saveRefreshToken(user._id.toString(), refreshToken, ipAddress);
        
        // Encrypt email and password with symmetric key
        const encryptedEmail = CryptoUtil.encrypt(email);
        const encryptedPassword = CryptoUtil.encrypt(password);
        
        // Return tokens, user info, and encrypted credentials
        return {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            isVerified: user.isVerified,
          },
          encryptedCredentials: {
            email: encryptedEmail,
            password: encryptedPassword
          }
        };
      }
    }

    // For demo purposes, accept any login with a "@example.com" email
    // You'd remove this in a production app
    if (email.endsWith('@example.com') && password.length >= 6) {
      // Create a demo user if it doesn't exist
      let demoUser = await this.userModel.findOne({ email }).exec();

      if (!demoUser) {
        // Hash the password for new users
        const hashedPassword = await this.hashPassword(password);
        
        demoUser = new this.userModel({
          email,
          password: hashedPassword,
        });
        await demoUser.save();
      }

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(
        demoUser._id.toString(),
        demoUser.email,
      );
      
      // Save refresh token
      await this.saveRefreshToken(demoUser._id.toString(), refreshToken, ipAddress);
      
      // Encrypt email and password with symmetric key
      const encryptedEmail = CryptoUtil.encrypt(email);
      const encryptedPassword = CryptoUtil.encrypt(password);

      return {
        accessToken,
        refreshToken,
        user: {
          id: demoUser._id,
          email,
          isVerified: demoUser.isVerified,
        },
        encryptedCredentials: {
          email: encryptedEmail,
          password: encryptedPassword
        }
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async signup(signupDto: SignupDto, request?: Request) {
    const { email, password } = signupDto;
    const ipAddress = request ? this.getIpFromRequest(request) : 'unknown';

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(password);

    // Create new user
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      isVerified: false,
    });

    // Save user to database
    await newUser.save();

    // Generate JWT tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      newUser._id.toString(),
      newUser.email,
    );
    
    // Save refresh token
    await this.saveRefreshToken(newUser._id.toString(), refreshToken, ipAddress);

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        email,
        isVerified: false,
      },
    };
  }

  async verifyToken(verifyTokenDto: VerifyTokenDto) {
    const { token } = verifyTokenDto;

    try {
      // Verify the JWT token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      
      // Find the user
      const user = await this.userModel.findById(userId).exec();
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      return {
        valid: true,
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
  
  async refreshToken(refreshTokenDto: RefreshTokenDto, request?: Request) {
    const { refreshToken } = refreshTokenDto;
    const ipAddress = request ? this.getIpFromRequest(request) : 'unknown';
    
    try {
      // Verify the refresh token with the refresh token secret
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('app.auth.refreshTokenSecret'),
      });
      
      const userId = payload.sub;
      
      // Find user and check if this refresh token exists and is active
      const user = await this.userModel.findById(userId).exec();
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      // Find the refresh token in the user's tokens
      const storedToken = user.refreshTokens.find(
        (rt) => rt.token === refreshToken && rt.isActive
      );
      
      if (!storedToken) {
        throw new ForbiddenException('Invalid refresh token');
      }
      
      // Check if token is expired
      if (new Date() > storedToken.expires) {
        throw new UnauthorizedException('Refresh token expired');
      }
      
      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
        user._id.toString(),
        user.email,
      );
      
      // Revoke the old refresh token
      storedToken.revoked = new Date();
      storedToken.revokedByIp = ipAddress;
      storedToken.replacedByToken = newRefreshToken;
      storedToken.isActive = false;
      
      // Save the new refresh token
      await this.saveRefreshToken(user._id.toString(), newRefreshToken, ipAddress);
      
      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || 
          error instanceof NotFoundException || 
          error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  
  /**
   * Decrypt credentials (email and password) for integration with other services
   */
  async decryptCredentials(decryptCredentialsDto: DecryptCredentialsDto): Promise<DecryptedCredentialsResponseDto> {
    try {
      const { encryptedEmail, encryptedPassword } = decryptCredentialsDto;
      
      // Validate that both inputs are provided
      if (!encryptedEmail || !encryptedPassword) {
        throw new BadRequestException('Both encryptedEmail and encryptedPassword are required');
      }
      
      // Decrypt the credentials
      const decryptedEmail = CryptoUtil.decrypt(encryptedEmail);
      const decryptedPassword = CryptoUtil.decrypt(encryptedPassword);
      
      return {
        email: decryptedEmail,
        password: decryptedPassword
      };
    } catch (error) {
      // Handle specific decryption errors
      if (error.message && error.message.includes('decrypt')) {
        throw new BadRequestException('Failed to decrypt credentials. The encrypted data may be invalid or corrupted.');
      }
      
      // Rethrow any BadRequestExceptions
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Catch-all for unexpected errors
      throw new InternalServerErrorException('An error occurred while decrypting credentials');
    }
  }
}
