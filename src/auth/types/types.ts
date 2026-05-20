import { type Request } from 'express';

// google SignIn Type
export interface User {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  provider: string;
}

// Create Account Type
export interface createAccountData {
  email: string;
  userName: string;
  token: string;
}

// Login User Type
export type UserSignin = Pick<User, 'email'> & {
  password: string;
};

// Reset Password Type
export type ResetPasswordType = Pick<User, 'email'>;

// Verify OTP Types
export interface VerifyOTP {
  otp: string;
}

// OAuth user types
export interface RequestWithUser extends Request {
  user: User;
}
