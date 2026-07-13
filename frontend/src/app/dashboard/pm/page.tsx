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
import { Plus, UserPlus, FolderKanban, ArrowLeft, ListChecks, Clock } from "lucide-react";

function PMDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [memberUserId, setMemberUserId] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProjects() {
    const res = await api.get("/projects");
    setProjects(res.data);
    setLoading(false);
  }

  async function loadTasks(projectId: number) {
    const res = await api.get(`/projects/${projectId}/tasks`);
    setTasks(res.data);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function selectProject(project: Project) {
    setSelectedProject(project);
    loadTasks(project.id);
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
    await api.post(`/projects/${selectedProject.id}/tasks`, { title: newTaskTitle });
    setNewTaskTitle("");
    loadTasks(selectedProject.id);
  }

  async function addMember(e: FormEvent) {
    e.preventDefault();
    if (!memberUserId || !selectedProject) return;
    try {
      await api.post(`/projects/${selectedProject.id}/members`, { userId: Number(memberUserId) });
      setMemberUserId("");
      loadProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to add member");
    }
  }

  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  if (loading) return <p className="p-10 text-muted">Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <AnimatePresence mode="wait">
          {!selectedProject ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="font-display text-2xl font-semibold">My projects</h1>
              <p className="text-sm text-muted">Create projects, assign your team, and track progress.</p>

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

              <form onSubmit={createProject} className="mt-6 flex gap-2">
                <Input
                  placeholder="New project name…"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="max-w-xs"
                />
                <Button type="submit">
                  <Plus className="h-4 w-4" /> Create project
                </Button>
              </form>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card
                      onClick={() => selectProject(p)}
                      className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-elevated"
                    >
                      <CardContent className="pt-5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-muted">{ticketId(p.id, "PRJ")}</span>
                          <Badge variant="outline">{p.status}</Badge>
                        </div>
                        <h3 className="mt-2 font-display text-lg font-semibold">{p.name}</h3>
                        {p.description && (
                          <p className="mt-1 text-sm text-muted line-clamp-2">{p.description}</p>
                        )}
                        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <ListChecks className="h-3.5 w-3.5" /> {p.tasks?.length || 0} tasks
                          </span>
                          <span className="flex items-center gap-1">
                            <UserPlus className="h-3.5 w-3.5" /> {p.members?.length || 0} members
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {projects.length === 0 && (
                <div className="mt-10 rounded-card border border-dashed border-border p-10 text-center">
                  <FolderKanban className="mx-auto h-8 w-8 text-muted" />
                  <p className="mt-2 text-sm text-muted">No projects yet — create your first one above.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                onClick={() => setSelectedProject(null)}
                className="mb-3 flex items-center gap-1 text-sm text-muted hover:text-accent"
              >
                <ArrowLeft className="h-4 w-4" /> All projects
              </button>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-muted">{ticketId(selectedProject.id, "PRJ")}</span>
                  <h2 className="font-display text-2xl font-semibold">{selectedProject.name}</h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Clock className="h-3.5 w-3.5" />
                  {doneCount}/{tasks.length} done
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <form onSubmit={createTask} className="flex gap-2">
                  <Input
                    placeholder="New task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="h-9 w-56 text-sm"
                  />
                  <Button type="submit" size="sm">
                    <Plus className="h-4 w-4" /> Add task
                  </Button>
                </form>

                <form onSubmit={addMember} className="flex gap-2">
                  <Input
                    placeholder="User ID to add"
                    value={memberUserId}
                    onChange={(e) => setMemberUserId(e.target.value)}
                    className="h-9 w-36 text-sm"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    <UserPlus className="h-4 w-4" /> Add member
                  </Button>
                </form>
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
