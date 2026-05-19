import { PickType } from '@nestjs/mapped-types';
import { SigninUserDto } from './signin-user';

export class ResetPasswordDto extends PickType(SigninUserDto, ['email']) {}
