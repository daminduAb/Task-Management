import { Request } from "express";
import { Role } from "@prisma/client";

// Payload embedded in every JWT
export interface JwtPayload {
  id: number;
  role: Role;
  iat?: number;
  exp?: number;
}

// Express Request, but with `req.user` guaranteed after requireAuth runs
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
