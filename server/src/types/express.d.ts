// src/types/express/index.d.ts
import { IUser } from "../../modules/auth/user.model"; // or wherever your User type/interface is

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // now TS knows Request can have `user`
    }
  }
}
