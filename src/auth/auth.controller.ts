import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user';
import { SigninUserDto } from './dto/signin-user';
import { AuthGuard } from '@nestjs/passport';
import { type RequestWithUser } from './types/user.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Create Account
  @Post('create-account')
  async createAccount(@Body() body: CreateUserDto) {
    return await this.authService.createAccount(body);
  }

  // SignIn Account
  @Post('signIn')
  signInToAccount(@Body() body: SigninUserDto) {
    return this.authService.signInToAccount(body);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() request: RequestWithUser) {
    return this.authService.googleSignIn(request);
  }
}
