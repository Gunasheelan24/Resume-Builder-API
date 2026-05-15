import { type Request } from 'express';

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

export interface RequestWithUser extends Request {
  user: User;
}
