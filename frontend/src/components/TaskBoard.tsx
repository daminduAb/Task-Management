"use client";

import api from "@/lib/api";
import { Task, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Trash2, User, Plus } from "lucide-react";

// ---------------------------------------------------------------------------
// Config — column order and per-priority styling live in one place, so
// changing a color or adding a column never means hunting through JSX.
// ---------------------------------------------------------------------------

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "TODO", label: "To do" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "DONE", label: "Done" },
];

type PriorityStyle = { bar: string; badge: string };

const PRIORITY_STYLES: Record<string, PriorityStyle> = {
  HIGH: { bar: "bg-rose-400", badge: "bg-rose-50 text-rose-600 border-rose-200" },
  MEDIUM: { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-600 border-amber-200" },
  LOW: { bar: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

function ticketId(id: number): string {
  return `TSK-${id}`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// Task card
// ---------------------------------------------------------------------------

type TaskCardProps = {
  task: Task;
  onMove: (taskId: number, newStatus: TaskStatus) => void;
  onDelete: (taskId: number) => void;
};

function TaskCard({ task, onMove, onDelete }: TaskCardProps) {
  const style = PRIORITY_STYLES[task.priority];
  const otherColumns = COLUMNS.filter((c) => c.key !== task.status);

  return (
    <div className="group relative mb-3 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className={cn("absolute inset-y-0 left-0 w-1", style.bar)} />

      <div className="p-3 pl-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-wide text-stone-400">
            {ticketId(task.id)}
          </span>
          <button
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
            className="rounded p-1 text-stone-300 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <h4 className="mb-1 text-sm font-medium leading-snug text-stone-800">
          {task.title}
        </h4>

        {task.description && (
          <p className="mb-2.5 line-clamp-2 text-xs leading-relaxed text-stone-500">
            {task.description}
          </p>
        )}

        <div className="mb-2.5 flex items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              style.badge
            )}
          >
            {task.priority}
          </span>
          {task.assignee ? (
            <span className="flex items-center gap-1 rounded-full bg-stone-100 py-0.5 pl-0.5 pr-2 text-[11px] text-stone-500">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-300 text-[8px] font-semibold text-white">
                {initials(task.assignee.name)}
              </span>
              {task.assignee.name}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-stone-400">
              <User className="h-3 w-3" /> Unassigned
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-stone-100 pt-2">
          {otherColumns.map((c) => (
            <button
              key={c.key}
              onClick={() => onMove(task.id, c.key)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
            >
              {c.label} <ArrowRight className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Board
// ---------------------------------------------------------------------------

type TaskBoardProps = {
  tasks: Task[];
  onChange: () => void;
};

export default function TaskBoard({ tasks, onChange }: TaskBoardProps) {
  async function moveTask(taskId: number, newStatus: TaskStatus) {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      onChange();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update task");
    }
  }

  async function deleteTask(taskId: number) {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      onChange();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete task");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 bg-stone-50 p-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="rounded-2xl bg-stone-100/70 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-stone-700">{col.label}</h3>
              <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] text-stone-400 shadow-sm">
                {colTasks.length}
              </span>
            </div>

            {colTasks.length > 0 ? (
              colTasks.map((task) => (
                <TaskCard key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-stone-300 py-8 text-center">
                <Plus className="h-4 w-4 text-stone-300" />
                <p className="text-xs text-stone-400">Nothing here yet</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}