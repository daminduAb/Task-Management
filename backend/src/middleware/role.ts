import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthRequest } from "../types";

// Usage: requireRole(['ADMIN']) or requireRole(['ADMIN', 'PM'])
// Must run AFTER requireAuth, since it reads req.user set by that middleware.
export default function requireRole(allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires role: ${allowedRoles.join(" or ")}`,
      });
      return;
    }

    next();
  };
}
