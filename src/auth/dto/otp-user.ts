import { PickType } from '@nestjs/mapped-types';
import { VerifyOTP } from '../types/types';
import { SigninUserDto } from './signin-user';

export class VerifyOtpDto
  extends PickType(SigninUserDto, ['email', 'password'])
  implements VerifyOTP
{
  otp!: string;
  confirmPassword!: string;
}
