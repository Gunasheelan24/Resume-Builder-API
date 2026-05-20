import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user';
import { SigninUserDto } from './dto/signin-user';
import { AuthGuard } from '@nestjs/passport';
import { type RequestWithUser } from './types/types';
import { ResetPasswordDto } from './dto/reset-password';
import { VerifyOtpDto } from './dto/otp-user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Create Account
  @Post('create-account')
  async createAccount(@Body() body: CreateUserDto) {
    return await this.authService.createAccount(body);
  }

  // SignIn Account
  @Post('signin')
  async signInToAccount(@Body() body: SigninUserDto) {
    return await this.authService.signInToAccount(body);
  }

  // set reset password link with otp
  @Post('reset-password')
  sentRestPasswordOtp(@Body() body: ResetPasswordDto) {
    return this.authService.sentResetPasswordOtp(body);
  }

  // verify OTP
  @Post('verify-otp')
  verifyOneTimePassword(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOneTimePasswordService(body);
  }

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() request: RequestWithUser) {
    return this.authService.oAuthSign(request);
  }

  // Github OAuth
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubPassport() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubCallback(@Req() request: RequestWithUser) {
    console.log(request.user);
    return this.authService.oAuthSign(request);
  }
}
