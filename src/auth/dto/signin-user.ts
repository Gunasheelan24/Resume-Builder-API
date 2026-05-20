import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { type UserSignin } from '../types/types';

export class SigninUserDto implements UserSignin {
  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(18)
  password!: string;
}
