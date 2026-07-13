"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import api from "@/lib/api";
import { User, Project, Role } from "@/types";
import { ticketId, cn } from "@/lib/utils";
import { Users, FolderKanban, ListChecks, ShieldCheck, Trash2 } from "lucide-react";

const roleBadgeClass: Record<string, string> = {
  ADMIN: "bg-indigo-50 text-indigo-700",
  PM: "bg-amber-50 text-amber-700",
  MEMBER: "bg-teal-50 text-teal-700",
};

function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
    await api.put(`/users/${userId}/role`, { role: newRole });
    loadData();
  }

  async function deleteUser(userId: number) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await api.delete(`/users/${userId}`);
    loadData();
  }

  const totalTasks = useMemo(
    () => projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0),
    [projects]
  );
  const admins = users.filter((u) => u.role === "ADMIN").length;

  if (loading) return <p className="p-10 text-muted">Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="font-display text-2xl font-semibold">Admin overview</h1>
        <p className="text-sm text-muted">Manage users, roles, and oversee every project.</p>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y divide-border">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} />
                      <div>
                        <div className="text-sm font-medium">{u.name}</div>
                        <div className="text-xs text-muted">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline", roleBadgeClass[u.role])}>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-priority-high hover:bg-red-50" onClick={() => deleteUser(u.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {projects.map((p) => (
                  <div key={p.id} className="rounded-md border border-border p-4 transition-colors hover:border-accent/50">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-muted">{ticketId(p.id, "PRJ")}</span>
                      <Badge variant="outline">{p.status}</Badge>
                    </div>
                    <div className="mt-1 font-medium">{p.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                      <Avatar name={p.owner?.name || "?"} className="h-5 w-5 text-[9px]" />
                      {p.owner?.name}
                      <span>·</span>
                      {p.tasks?.length || 0} tasks
                    </div>
                  </div>
                ))}
                {projects.length === 0 && <p className="text-sm text-muted">No projects yet.</p>}
              </div>
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
