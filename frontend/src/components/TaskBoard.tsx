"use client";

import { AnimatePresence, motion } from "framer-motion";
import api from "@/lib/api";
import { Task, TaskStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ticketId, cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "TODO", label: "To do" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "DONE", label: "Done" },
];

const priorityBorder: Record<string, string> = {
  HIGH: "border-l-priority-high",
  MEDIUM: "border-l-priority-medium",
  LOW: "border-l-priority-low",
};

const priorityBadgeVariant: Record<string, "high" | "medium" | "low"> = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export default function TaskBoard({ tasks, onChange }: { tasks: Task[]; onChange: () => void }) {
  async function moveTask(taskId: number, newStatus: TaskStatus) {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      onChange();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update task");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="rounded-card bg-canvas p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
                {col.label}
              </h4>
              <span className="font-mono text-xs text-muted">{colTasks.length}</span>
            </div>

            <AnimatePresence initial={false}>
              {colTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    "mb-3 rounded-card border-l-4 bg-surface p-3 shadow-card",
                    priorityBorder[task.priority]
                  )}
                >
                  <div className="mb-1 font-mono text-[11px] text-muted">{ticketId(task.id)}</div>
                  <div className="mb-1 text-sm font-medium leading-snug">{task.title}</div>
                  {task.description && (
                    <p className="mb-2 text-xs text-muted line-clamp-2">{task.description}</p>
                  )}
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant={priorityBadgeVariant[task.priority]}>{task.priority}</Badge>
                    {task.assignee && <Badge variant="outline">{task.assignee.name}</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                      <button
                        key={c.key}
                        onClick={() => moveTask(task.id, c.key)}
                        className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted transition-colors hover:border-accent hover:text-accent"
                      >
                        {c.label} <ArrowRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {colTasks.length === 0 && (
              <p className="px-1 text-xs italic text-muted/70">No tasks</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
