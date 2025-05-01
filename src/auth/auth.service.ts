import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ email }).exec();

    // Verify password (in a real app, you would compare hashed passwords)
    if (user && user.password === password) {
      // Generate a token (in a real app, you would use JWT)
      const token = `token-${Date.now()}-${user._id}`;

      // Add token to user's tokens array
      user.tokens.push(token);
      await user.save();

      return {
        token: token,
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified,
        },
      };
    }

    // For demo purposes, accept any login with a "@example.com" email
    // You'd remove this in a production app
    if (email.endsWith('@example.com') && password.length >= 6) {
      // Create a demo user if it doesn't exist
      let demoUser = await this.userModel.findOne({ email }).exec();

      if (!demoUser) {
        demoUser = new this.userModel({
          email,
          password,
        });
        await demoUser.save();
      }

      const token = `token-${Date.now()}-${demoUser._id}`;
      demoUser.tokens.push(token);
      await demoUser.save();

      return {
        accessToken: token,
        user: {
          id: demoUser._id,
          email,
          isVerified: demoUser.isVerified,
        },
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async signup(signupDto: SignupDto) {
    const { email, password } = signupDto;

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Create new user
    const newUser = new this.userModel({
      email,
      password, // In a real app, you would hash this password
      isVerified: false,
    });

    // Generate auth token
    const token = `token-${Date.now()}-${newUser._id}`;
    newUser.tokens.push(token);

    // Save user to database
    await newUser.save();

    return {
      verificationToken: token,
      user: {
        id: newUser._id,
        email,
        isVerified: false,
      },
    };
  }

  async verifyToken(verifyTokenDto: VerifyTokenDto) {
    const { token } = verifyTokenDto;

    // Find user with this token
    const user = await this.userModel.findOne({ tokens: token }).exec();

    if (user) {
      return {
        valid: true,
        token: 'test',
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified,
        },
      };
    }

    throw new UnauthorizedException('Invalid token');
  }
}
