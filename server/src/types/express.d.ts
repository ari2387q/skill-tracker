
import { IUser } from "../modules/auth/user.model";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export {};