export type Role = "ADMIN" | "PM" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface ProjectMember {
  id: number;
  userId: number;
  projectId: number;
  user?: User;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  projectId: number;
  project?: { id: number; name: string };
  assignedTo?: number | null;
  assignee?: { id: number; name: string } | null;
  creator?: { id: number; name: string };
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  ownerId: number;
  owner?: { id: number; name: string };
  members?: ProjectMember[];
  tasks?: Task[];
  createdAt: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  userId: number;
  comment: string;
  createdAt: string;
  user?: { id: number; name: string };
}
