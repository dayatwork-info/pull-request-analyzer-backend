import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, req);
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Req() req: Request) {
    return this.authService.signup(signupDto, req);
  }

  @Post('verify')
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    return this.authService.verifyToken(verifyTokenDto);
  }
  
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refreshToken(refreshTokenDto, req);
  }
  
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.sub,
      email: user.email,
    };
  }
}
