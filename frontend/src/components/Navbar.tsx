"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { LogOut, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const roleStyles: Record<string, string> = {
  ADMIN: "bg-indigo-50 text-indigo-700",
  PM: "bg-amber-50 text-amber-700",
  MEMBER: "bg-teal-50 text-teal-700",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/80 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-5 w-5 text-accent" />
        <span className="font-display text-lg font-semibold tracking-tight">Taskflow</span>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={cn("hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline", roleStyles[user.role])}
        >
          {user.role}
        </span>
        <Avatar name={user.name} />
        <span className="hidden text-sm text-muted md:inline">{user.name}</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
