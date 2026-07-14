import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest, JwtPayload } from "../types";

// Helper: is this user allowed to see/manage this project?
export async function userCanAccessProject(user: JwtPayload, projectId: number): Promise<boolean> {
  if (user.role === "ADMIN") return true;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });
  if (!project) return false;

  if (project.ownerId === user.id) return true;
  return project.members.some((m) => m.userId === user.id);
}

// GET /api/projects
export async function getProjects(req: AuthRequest, res: Response) {
  const user = req.user!;
  let projects;

  if (user.role === "ADMIN") {
    projects = await prisma.project.findMany({
      include: { owner: { select: { id: true, name: true } }, members: true, tasks: true },
    });
  } else if (user.role === "PM") {
    projects = await prisma.project.findMany({
      where: { ownerId: user.id },
      include: { owner: { select: { id: true, name: true } }, members: true, tasks: true },
    });
  } else {
    projects = await prisma.project.findMany({
      where: { members: { some: { userId: user.id } } },
      include: { owner: { select: { id: true, name: true } }, members: true, tasks: true },
    });
  }

  res.json(projects);
}

// POST /api/projects (PM or Admin)
export async function createProject(req: AuthRequest, res: Response) {
  const { name, description } = req.body;

  const project = await prisma.project.create({
    data: { name, description, ownerId: req.user!.id },
  });

  await prisma.activityLog.create({
    data: { userId: req.user!.id, action: "CREATED_PROJECT", entityType: "Project", entityId: project.id },
  });

  res.status(201).json(project);
}

// GET /api/projects/:id
export async function getProjectById(req: AuthRequest, res: Response) {
  const projectId = Number(req.params.id);

  const allowed = await userCanAccessProject(req.user!, projectId);
  if (!allowed) return res.status(403).json({ error: "Access denied" });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      tasks: { include: { assignee: { select: { id: true, name: true } } } },
    },
  });

  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
}

// PUT /api/projects/:id (owner PM or Admin only)
export async function updateProject(req: AuthRequest, res: Response) {
  const projectId = Number(req.params.id);
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) return res.status(404).json({ error: "Project not found" });
  if (req.user!.role !== "ADMIN" && project.ownerId !== req.user!.id) {
    return res.status(403).json({ error: "Only the project owner or Admin can edit this project" });
  }

  const { name, description, status } = req.body;
  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name, description, status },
  });

  res.json(updated);
}

// DELETE /api/projects/:id (owner PM or Admin only)
export async function deleteProject(req: AuthRequest, res: Response) {
  const projectId = Number(req.params.id);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return res.status(404).json({
      error: "Project not found",
    });
  }

  if (
    req.user!.role !== "ADMIN" &&
    project.ownerId !== req.user!.id
  ) {
    return res.status(403).json({
      error: "Only the project owner or Admin can delete this project",
    });
  }

  await prisma.$transaction(async (tx) => {
    // Delete project members
    await tx.projectMember.deleteMany({
      where: { projectId },
    });

    // Delete project tasks
    await tx.task.deleteMany({
      where: { projectId },
    });

    // Delete activity logs (if they reference this project)
    await tx.activityLog.deleteMany({
      where: {
        entityType: "Project",
        entityId: projectId,
      },
    });

    // Finally delete the project
    await tx.project.delete({
      where: { id: projectId },
    });
  });

  return res.json({
    message: "Project deleted successfully",
  });
}

// POST /api/projects/:id/members (owner PM or Admin)
export async function addMember(req: AuthRequest, res: Response) {
  const projectId = Number(req.params.id);
  const { userId } = req.body;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return res.status(404).json({ error: "Project not found" });
  if (req.user!.role !== "ADMIN" && project.ownerId !== req.user!.id) {
    return res.status(403).json({ error: "Only the project owner or Admin can add members" });
  }

  const member = await prisma.projectMember.create({ data: { projectId, userId } });
  res.status(201).json(member);
}

// DELETE /api/projects/:id/members/:userId
export async function removeMember(req: AuthRequest, res: Response) {
  const projectId = Number(req.params.id);
  const userId = Number(req.params.userId);

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return res.status(404).json({ error: "Project not found" });
  if (req.user!.role !== "ADMIN" && project.ownerId !== req.user!.id) {
    return res.status(403).json({ error: "Only the project owner or Admin can remove members" });
  }

  await prisma.projectMember.deleteMany({ where: { projectId, userId } });
  res.json({ message: "Member removed" });
}
