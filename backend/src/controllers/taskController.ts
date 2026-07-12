import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../types";
import { userCanAccessProject } from "./projectController";

// GET /api/projects/:projectId/tasks
export async function getTasksForProject(req: AuthRequest, res: Response) {
  const projectId = Number(req.params.projectId);

  const allowed = await userCanAccessProject(req.user!, projectId);
  if (!allowed) return res.status(403).json({ error: "Access denied" });

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(tasks);
}

// GET /api/tasks/my (Member: tasks assigned to me across all projects)
export async function getMyTasks(req: AuthRequest, res: Response) {
  const tasks = await prisma.task.findMany({
    where: { assignedTo: req.user!.id },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { dueDate: "asc" },
  });
  res.json(tasks);
}

// POST /api/projects/:projectId/tasks (PM who owns project, or Admin)
export async function createTask(req: AuthRequest, res: Response) {
  const projectId = Number(req.params.projectId);
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) return res.status(404).json({ error: "Project not found" });
  if (req.user!.role !== "ADMIN" && project.ownerId !== req.user!.id) {
    return res.status(403).json({ error: "Only the project owner or Admin can create tasks" });
  }

  const { title, description, priority, dueDate, assignedTo } = req.body;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedTo || null,
      projectId,
      createdBy: req.user!.id,
    },
  });

  await prisma.activityLog.create({
    data: { userId: req.user!.id, action: "CREATED_TASK", entityType: "Task", entityId: task.id },
  });

  res.status(201).json(task);
}

// PUT /api/tasks/:id/status
export async function updateTaskStatus(req: AuthRequest, res: Response) {
  const taskId = Number(req.params.id);
  const { status } = req.body;

  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
  if (!task) return res.status(404).json({ error: "Task not found" });

  const user = req.user!;
  const isOwnerPM = user.role === "PM" && task.project.ownerId === user.id;
  const isAssignee = task.assignedTo === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isAdmin && !isOwnerPM && !isAssignee) {
    return res.status(403).json({ error: "You do not have permission to update this task" });
  }

  const updated = await prisma.task.update({ where: { id: taskId }, data: { status } });

  await prisma.activityLog.create({
    data: { userId: user.id, action: `TASK_STATUS_${status}`, entityType: "Task", entityId: taskId },
  });

  res.json(updated);
}

// PUT /api/tasks/:id (PM/Admin only - full edit)
export async function updateTask(req: AuthRequest, res: Response) {
  const taskId = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (req.user!.role !== "ADMIN" && task.project.ownerId !== req.user!.id) {
    return res.status(403).json({ error: "Only the project owner or Admin can edit this task" });
  }

  const { title, description, priority, dueDate, assignedTo, status } = req.body;
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      description,
      priority,
      status,
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });

  res.json(updated);
}

// DELETE /api/tasks/:id (PM/Admin only)
export async function deleteTask(req: AuthRequest, res: Response) {
  const taskId = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (req.user!.role !== "ADMIN" && task.project.ownerId !== req.user!.id) {
    return res.status(403).json({ error: "Only the project owner or Admin can delete this task" });
  }

  await prisma.task.delete({ where: { id: taskId } });
  res.json({ message: "Task deleted" });
}

// POST /api/tasks/:id/comments
export async function addComment(req: AuthRequest, res: Response) {
  const taskId = Number(req.params.id);
  const { comment } = req.body;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return res.status(404).json({ error: "Task not found" });

  const allowed = await userCanAccessProject(req.user!, task.projectId);
  if (!allowed) return res.status(403).json({ error: "Access denied" });

  const created = await prisma.taskComment.create({
    data: { taskId, userId: req.user!.id, comment },
    include: { user: { select: { id: true, name: true } } },
  });

  res.status(201).json(created);
}

// GET /api/tasks/:id/comments
export async function getComments(req: AuthRequest, res: Response) {
  const taskId = Number(req.params.id);
  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  res.json(comments);
}
