import { type Request } from 'express';

// google SignIn
export interface User {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  provider: string;
}

// Login User
export type UserSignin = Pick<User, 'email'> & {
  password: string;
};

// OAuth user types
export interface RequestWithUser extends Request {
  user: User;
}
