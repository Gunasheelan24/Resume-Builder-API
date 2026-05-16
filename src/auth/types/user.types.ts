import { type Request } from 'express';

// google SignIn
export interface User {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

// Login User
export type UserSignin = Pick<User, 'email'> & {
  password: string;
};

export interface RequestWithUser extends Request {
  user: User;
}
