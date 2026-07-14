"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { ProjectProgress } from "@/components/ProjectProgress";
import { AvatarStack } from "@/components/AvatarStack";
import api from "@/lib/api";
import { User, Project, Role } from "@/types";
import { ticketId, cn } from "@/lib/utils";
import {
  Users,
  FolderKanban,
  ListChecks,
  ShieldCheck,
  Trash2,
  Search,
  Loader2,
  ShieldAlert,
} from "lucide-react";

const roleBadgeClass: Record<string, string> = {
  ADMIN: "bg-indigo-50 text-indigo-700",
  PM: "bg-amber-50 text-amber-700",
  MEMBER: "bg-teal-50 text-teal-700",
};

const ROLE_FILTERS: { key: Role | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "ADMIN", label: "Admin" },
  { key: "PM", label: "PM" },
  { key: "MEMBER", label: "Member" },
];

function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");

  async function loadData() {
    const [usersRes, projectsRes] = await Promise.all([api.get("/users"), api.get("/projects")]);
    setUsers(usersRes.data);
    setProjects(projectsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function changeRole(userId: number, newRole: Role) {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update role");
    }
  }

  async function deleteUser(userId: number) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/users/${userId}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete user");
    }
  }

  async function deleteProjectAsAdmin(projectId: number) {
    if (!confirm("Delete this project? This also deletes all its tasks.")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete project");
    }
  }

  async function updateProjectStatus(projectId: number, status: string) {
    try {
      await api.put(`/projects/${projectId}`, { status });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update project status");
    }
  }

  const totalTasks = useMemo(
    () => projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0),
    [projects]
  );
  const admins = users.filter((u) => u.role === "ADMIN").length;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, roleFilter]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm">Loading overview…</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-accent">
          <ShieldAlert className="h-3.5 w-3.5" /> Admin
        </div>
        <h1 className="mt-1 font-display text-2xl font-semibold">System overview</h1>
        <p className="mt-1 text-sm text-muted">Manage users, roles, and oversee every project.</p>

        {/* Stat cards - stack 2-up on mobile, 4-up from md */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <StatCard label="Total users" value={users.length} icon={Users} delay={0} />
          <StatCard
            label="Projects"
            value={projects.length}
            icon={FolderKanban}
            accentClass="bg-amber-50 text-amber-700"
            delay={0.05}
          />
          <StatCard
            label="Total tasks"
            value={totalTasks}
            icon={ListChecks}
            accentClass="bg-teal-50 text-teal-700"
            delay={0.1}
          />
          <StatCard
            label="Admins"
            value={admins}
            icon={ShieldCheck}
            accentClass="bg-indigo-50 text-indigo-700"
            delay={0.15}
          />
        </div>

        {/* Users */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="mt-6">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                    <Input
                      placeholder="Search name or email…"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="h-8 w-full pl-8 text-xs sm:w-56"
                    />
                  </div>
                  <div className="flex gap-1 overflow-x-auto rounded-md bg-canvas p-1">
                    {ROLE_FILTERS.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setRoleFilter(f.key)}
                        className={cn(
                          "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                          roleFilter === f.key ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y divide-border">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{u.name}</div>
                        <div className="truncate text-xs text-muted">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-11 sm:pl-0">
                      <span
                        className={cn(
                          "hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline",
                          roleBadgeClass[u.role]
                        )}
                      >
                        {u.role}
                      </span>
                      <Select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value as Role)}
                        className="h-8 w-28 text-xs"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="PM">PM</option>
                        <option value="MEMBER">MEMBER</option>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-priority-high hover:bg-red-50"
                        onClick={() => deleteUser(u.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="py-10 text-center">
                    <Users className="mx-auto h-7 w-7 text-muted" />
                    <p className="mt-2 text-sm text-muted">No users match your search.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Projects */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All projects ({projects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => {
                  const total = p.tasks?.length || 0;
                  const done = p.tasks?.filter((t) => t.status === "DONE").length || 0;
                  const memberNames = p.members?.map((m) => m.user?.name || "?") || [];

                  return (
                    <div
                      key={p.id}
                      className="rounded-md border border-border p-4 transition-colors hover:border-accent/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-muted">{ticketId(p.id, "PRJ")}</span>
                        <Select
                          value={p.status}
                          onChange={(e) => updateProjectStatus(p.id, e.target.value)}
                          className="h-7 w-28 shrink-0 text-[11px]"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="ON_HOLD">ON_HOLD</option>
                        </Select>
                      </div>

                      <div className="mt-2 flex items-start justify-between gap-2">
                        <div className="font-medium">{p.name}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-priority-high hover:bg-red-50"
                          onClick={() => deleteProjectAsAdmin(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                        <Avatar name={p.owner?.name || "?"} className="h-5 w-5 text-[9px]" />
                        {p.owner?.name}
                      </div>

                      <div className="mt-3">
                        <ProjectProgress done={done} total={total} />
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        {memberNames.length > 0 ? (
                          <AvatarStack names={memberNames} />
                        ) : (
                          <span className="text-xs text-muted">No members yet</span>
                        )}
                        <span className="text-xs text-muted">{total} tasks</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {projects.length === 0 && (
                <div className="py-10 text-center">
                  <FolderKanban className="mx-auto h-7 w-7 text-muted" />
                  <p className="mt-2 text-sm text-muted">No projects yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
