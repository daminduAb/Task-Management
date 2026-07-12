import { Response } from "express";
import { Role } from "@prisma/client";
import prisma from "../config/db";
import { AuthRequest } from "../types";

// GET /api/users (Admin only)
export async function getAllUsers(req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
}

// PUT /api/users/:id/role (Admin only)
export async function updateUserRole(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { role } = req.body as { role: Role };

  if (!["ADMIN", "PM", "MEMBER"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: `CHANGED_ROLE_TO_${role}`,
      entityType: "User",
      entityId: user.id,
    },
  });

  res.json({ message: "Role updated", user });
}

// DELETE /api/users/:id (Admin only)
export async function deleteUser(req: AuthRequest, res: Response) {
  const { id } = req.params;
  await prisma.user.delete({ where: { id: Number(id) } });
  res.json({ message: "User deleted" });
}
