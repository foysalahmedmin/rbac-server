import { JwtPayload } from "jsonwebtoken";
import { TRole } from "../types/role.type";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id: number;
        email: string;
        role: TRole;
      };
    }
  }
}
