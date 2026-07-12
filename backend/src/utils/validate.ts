import { Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { AuthRequest } from "../types";

// Wraps a zod schema as express middleware. On failure, returns 400 with field errors.
export function validateBody(schema: ZodSchema) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export const schemas = {
  register: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
  }),

  createProject: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
  }),

  createTask: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    dueDate: z.string().optional(),
    assignedTo: z.number().int().optional(),
  }),

  updateTaskStatus: z.object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  }),

  addMember: z.object({
    userId: z.number().int(),
  }),

  addComment: z.object({
    comment: z.string().min(1),
  }),
};
