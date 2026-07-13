"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import api from "@/lib/api";
import { Task, TaskStatus } from "@/types";
import { ticketId, cn } from "@/lib/utils";
import { ListTodo, Loader2, CheckCircle2, Inbox } from "lucide-react";

const priorityBadgeVariant: Record<string, "high" | "medium" | "low"> = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

const FILTERS: { key: TaskStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "TODO", label: "To do" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "DONE", label: "Done" },
];

function MemberDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskStatus | "ALL">("ALL");

  async function loadTasks() {
    const res = await api.get("/tasks/my");
    setTasks(res.data);
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function updateStatus(taskId: number, status: TaskStatus) {
    await api.put(`/tasks/${taskId}/status`, { status });
    loadTasks();
  }

  const counts = useMemo(
    () => ({
      todo: tasks.filter((t) => t.status === "TODO").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      done: tasks.filter((t) => t.status === "DONE").length,
    }),
    [tasks]
  );

  const visibleTasks = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  if (loading) return <p className="p-10 text-muted">Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="font-display text-2xl font-semibold">My tasks</h1>
        <p className="text-sm text-muted">Everything assigned to you, across every project.</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatCard label="To do" value={counts.todo} icon={ListTodo} accentClass="bg-red-50 text-priority-high" />
          <StatCard
            label="In progress"
            value={counts.inProgress}
            icon={Loader2}
            accentClass="bg-amber-50 text-priority-medium"
            delay={0.05}
          />
          <StatCard
            label="Done"
            value={counts.done}
            icon={CheckCircle2}
            accentClass="bg-green-50 text-priority-low"
            delay={0.1}
          />
        </div>

        <div className="mt-6 flex gap-1 rounded-md bg-canvas p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                filter === f.key ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {visibleTasks.length === 0 && (
            <div className="rounded-card border border-dashed border-border p-10 text-center">
              <Inbox className="mx-auto h-8 w-8 text-muted" />
              <p className="mt-2 text-sm text-muted">No tasks in this view.</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {visibleTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card>
                  <CardContent className="flex items-start justify-between gap-4 pt-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-muted">{ticketId(task.id)}</span>
                        <Badge variant="outline">{task.project?.name}</Badge>
                      </div>
                      <h4 className="mt-1 font-medium">{task.title}</h4>
                      {task.description && <p className="mt-1 text-sm text-muted">{task.description}</p>}
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant={priorityBadgeVariant[task.priority]}>{task.priority}</Badge>
                        {task.dueDate && (
                          <span className="text-xs text-muted">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Select
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                      className="h-9 w-36 shrink-0 text-xs"
                    >
                      <option value="TODO">To do</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="DONE">Done</option>
                    </Select>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["MEMBER"]}>
      <MemberDashboard />
    </ProtectedRoute>
  );
}
