import { Response } from "express";
import { Role } from "@prisma/client";
import prisma from "../config/db";
import { AuthRequest } from "../types";

// GET /api/users/basic (Admin or PM)
// Minimal user info for PMs picking team members to add to a project -
// deliberately excludes role/createdAt so this can't be used as an admin
// snooping tool, just enough to identify who's who.
export async function getBasicUserList(req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  res.json(users);
}

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
  const userId = Number(req.params.id);

  // Things that genuinely can't be silently deleted - the Admin needs to
  // reassign or remove these first, since deleting them would destroy
  // real project/task data the user didn't ask to lose.
  const ownedProjects = await prisma.project.count({ where: { ownerId: userId } });
  const createdTasks = await prisma.task.count({ where: { createdBy: userId } });

  if (ownedProjects > 0 || createdTasks > 0) {
    return res.status(400).json({
      error: `Cannot delete this user: they own ${ownedProjects} project(s) and created ${createdTasks} task(s). Reassign or delete those first.`,
    });
  }

  // Everything else tied to this user is safe to clean up automatically -
  // comments and activity log entries are just historical records, and
  // unassigning them from tasks (rather than blocking deletion) is the
  // more sensible admin behavior.
  await prisma.$transaction([
    prisma.task.updateMany({ where: { assignedTo: userId }, data: { assignedTo: null } }),
    prisma.taskComment.deleteMany({ where: { userId } }),
    prisma.activityLog.deleteMany({ where: { userId } }),
    prisma.projectMember.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  res.json({ message: "User deleted" });
}
