import { User } from '../user/models/user.entity';

export interface AuthData {
  user: User;
}

declare module 'express' {
  interface Request {
    auth?: AuthData;
  }
}
