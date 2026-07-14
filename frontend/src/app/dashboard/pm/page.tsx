"use client";

import { useEffect, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import TaskBoard from "@/components/TaskBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Project, Task } from "@/types";
import { cn, ticketId } from "@/lib/utils";
import {
  Plus,
  UserPlus,
  FolderKanban,
  ArrowLeft,
  ListChecks,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";

interface BasicUser {
  id: number;
  name: string;
  email: string;
}

// ---------------------------------------------------------------------------
// Small presentational helpers — kept local since they're only used here.
// ---------------------------------------------------------------------------

function ProjectProgress({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>
          {done}/{total} done
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function AvatarStack({ names }: { names: string[] }) {
  const shown = names.slice(0, 4);
  const overflow = names.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((name, i) => (
        <Avatar
          key={i}
          name={name}
          className="h-6 w-6 border-2 border-surface text-[9px]"
        />
      ))}
      {overflow > 0 && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-canvas text-[9px] font-medium text-muted">
          +{overflow}
        </span>
      )}
    </div>
  );
}

function SectionPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function PMDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [memberUserId, setMemberUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<BasicUser[]>([]);
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");

  async function loadProjects() {
    const res = await api.get("/projects");
    setProjects(res.data);
    setLoading(false);
  }

  async function deleteProject(projectId: number) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this project? This will also delete all its tasks."
  );

  if (!confirmed) return;

  try {
    await api.delete(`/projects/${projectId}`);

    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      setTasks([]);
    }

    loadProjects();
  } catch (err: any) {
    alert(err.response?.data?.error || "Failed to delete project");
  }
}

  async function loadTasks(projectId: number) {
    const res = await api.get(`/projects/${projectId}/tasks`);
    setTasks(res.data);
  }

  async function loadUsers() {
    const res = await api.get("/users/basic");
    setAllUsers(res.data);
  }

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  async function selectProject(project: Project) {
    setSelectedProject(project);
    loadTasks(project.id);
    const res = await api.get(`/projects/${project.id}`);
    setSelectedProject(res.data);
  }

  async function createProject(e: FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    await api.post("/projects", { name: newProjectName });
    setNewProjectName("");
    loadProjects();
  }

  async function createTask(e: FormEvent) {
  e.preventDefault();
  if (!newTaskTitle.trim() || !selectedProject) return;
  await api.post(`/projects/${selectedProject.id}/tasks`, {
    title: newTaskTitle,
    assignedTo: newTaskAssignee ? Number(newTaskAssignee) : undefined,
    priority: newTaskPriority,
  });
  setNewTaskTitle("");
  setNewTaskAssignee("");
  setNewTaskPriority("MEDIUM");
  loadTasks(selectedProject.id);
}

  async function addMember(e: FormEvent) {
    e.preventDefault();
    if (!memberUserId || !selectedProject) return;
    try {
      await api.post(`/projects/${selectedProject.id}/members`, {
        userId: Number(memberUserId),
      });
      setMemberUserId("");
      const res = await api.get(`/projects/${selectedProject.id}`);
      setSelectedProject(res.data);
      loadProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to add member");
    }
  }

  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm">Loading your projects…</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <AnimatePresence mode="wait">
          {!selectedProject ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-accent">
                    <Sparkles className="h-3.5 w-3.5" /> Workspace
                  </span>
                  <h1 className="mt-1 font-display text-2xl font-semibold">My projects</h1>
                  <p className="mt-1 text-sm text-muted">
                    Create projects, assign your team, and track progress.
                  </p>
                </div>

                <form onSubmit={createProject} className="flex gap-2">
                  <Input
                    placeholder="New project name…"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-56"
                  />
                  <Button type="submit">
                    <Plus className="h-4 w-4" /> Create project
                  </Button>
                </form>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                <StatCard label="Projects" value={projects.length} icon={FolderKanban} />
                <StatCard
                  label="Total tasks"
                  value={projects.reduce((s, p) => s + (p.tasks?.length || 0), 0)}
                  icon={ListChecks}
                  accentClass="bg-teal-50 text-teal-700"
                  delay={0.05}
                />
                <StatCard
                  label="Team members"
                  value={new Set(projects.flatMap((p) => p.members?.map((m) => m.userId) || [])).size}
                  icon={UserPlus}
                  accentClass="bg-amber-50 text-amber-700"
                  delay={0.1}
                />
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p, i) => {
                  const total = p.tasks?.length || 0;
                  const done = p.tasks?.filter((t) => t.status === "DONE").length || 0;
                  const memberNames = p.members?.map((m) => m.user?.name || "?") || [];
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Card
                        onClick={() => selectProject(p)}
                        className="group cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-elevated"
                      >
                        <CardContent className="pt-5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] text-muted">
                              {ticketId(p.id, "PRJ")}
                            </span>
                            <Badge variant="outline">{p.status}</Badge>
                          </div>

                          <h3 className="mt-2 font-display text-lg font-semibold transition-colors group-hover:text-accent">
                            {p.name}
                          </h3>
                          {p.description && (
                            <p className="mt-1 text-sm text-muted line-clamp-2">{p.description}</p>
                          )}

                          <div className="mt-4">
                            <ProjectProgress done={done} total={total} />
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                            {memberNames.length > 0 ? (
                              <AvatarStack names={memberNames} />
                            ) : (
                              <span className="text-xs text-muted">No members yet</span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-muted">
                              <ListChecks className="h-3.5 w-3.5" /> {total} tasks
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {projects.length === 0 && (
                <div className="mt-10 rounded-card border border-dashed border-border p-10 text-center">
                  <FolderKanban className="mx-auto h-8 w-8 text-muted" />
                  <p className="mt-2 text-sm font-medium">No projects yet</p>
                  <p className="mt-1 text-sm text-muted">
                    Create your first one using the field above.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                onClick={() => setSelectedProject(null)}
                className="mb-3 flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent"
              >
                <ArrowLeft className="h-4 w-4" /> All projects
              </button>

              <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-muted">
        {ticketId(selectedProject.id, "PRJ")}
      </span>
      <Badge variant="outline">{selectedProject.status}</Badge>
    </div>

    <h2 className="mt-1 font-display text-2xl font-semibold">
      {selectedProject.name}
    </h2>

    {selectedProject.description && (
      <p className="mt-1 max-w-xl text-sm text-muted">
        {selectedProject.description}
      </p>
    )}
  </div>

  <div className="flex items-center gap-3">
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted">
      <Clock className="h-3.5 w-3.5" />
      {doneCount}/{tasks.length} done
    </div>

    <Button
      variant="destructive"
      size="sm"
      onClick={() => deleteProject(selectedProject.id)}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete Project
    </Button>
  </div>
</div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionPanel title="New task">
                  <form onSubmit={createTask} className="flex flex-wrap gap-2">
                    <Input
                      placeholder="Task title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="h-9 min-w-[10rem] flex-1 text-sm"
                    />
                    <Select
  value={newTaskAssignee}
  onChange={(e) => setNewTaskAssignee(e.target.value)}
  className="h-9 w-36 text-sm"
>
  <option value="">
    {selectedProject.members && selectedProject.members.length > 0
      ? "Unassigned"
      : "Add a teammate first"}
  </option>
  {selectedProject.members?.map((m) => (
    <option key={m.userId} value={m.userId}>
      {m.user?.name}
    </option>
  ))}
</Select>
<Select
  value={newTaskPriority}
  onChange={(e) => setNewTaskPriority(e.target.value)}
  className="h-9 w-28 text-sm"
>
  <option value="LOW">Low</option>
  <option value="MEDIUM">Medium</option>
  <option value="HIGH">High</option>
</Select>
<Button type="submit" size="sm">
  <Plus className="h-4 w-4" /> Add task
</Button>
                  </form>
                </SectionPanel>

                <SectionPanel title="Add teammate">
                  <form onSubmit={addMember} className="flex flex-wrap gap-2">
                    <Select
                      value={memberUserId}
                      onChange={(e) => setMemberUserId(e.target.value)}
                      className="h-9 min-w-[12rem] flex-1 text-sm"
                    >
                      <option value="">Select a person…</option>
                      {allUsers
                        .filter(
                          (u) =>
                            u.id !== selectedProject.ownerId &&
                            !selectedProject.members?.some((m) => m.userId === u.id)
                        )
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                    </Select>
                    <Button type="submit" size="sm" variant="outline" disabled={!memberUserId}>
                      <UserPlus className="h-4 w-4" /> Add member
                    </Button>
                  </form>

                  {selectedProject.members && selectedProject.members.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      {selectedProject.members.map((m) => (
                        <div
                          key={m.userId}
                          className="flex items-center gap-1.5 rounded-full border border-border bg-canvas py-1 pl-1 pr-3 text-xs"
                        >
                          <Avatar name={m.user?.name || "?"} className="h-5 w-5 text-[9px]" />
                          {m.user?.name}
                        </div>
                      ))}
                    </div>
                  )}
                </SectionPanel>
              </div>

              <div className="mt-6">
                <TaskBoard tasks={tasks} onChange={() => loadTasks(selectedProject.id)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["PM"]}>
      <PMDashboard />
    </ProtectedRoute>
  );
}