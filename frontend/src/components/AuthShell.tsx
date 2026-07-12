"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, CheckCircle2, Users, KanbanSquare } from "lucide-react";

const FEATURES = [
  { icon: KanbanSquare, text: "Kanban boards that update in real time" },
  { icon: Users, text: "Role-based access for Admins, PMs, and Members" },
  { icon: CheckCircle2, text: "Clear ownership on every task" },
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Left branded panel - hidden on small screens */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-ink lg:flex">
        {/* Decorative floating shapes */}
        <motion.div
          className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-10 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl"
          animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Ticket-style decorative grid, echoes the mono ticket IDs used on cards */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-md px-10 text-white">
          <div className="mb-8 flex items-center gap-2">
            <LayoutGrid className="h-7 w-7 text-teal-300" />
            <span className="font-display text-2xl font-semibold">Taskflow</span>
          </div>

          <h1 className="font-display text-3xl font-semibold leading-tight">
            Ship projects with clarity, not chaos.
          </h1>
          <p className="mt-3 text-sm text-white/60">
            One workspace for Admins, Project Managers, and Team Members — everyone sees exactly
            what they need.
          </p>

          <div className="mt-10 flex flex-col gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <f.icon className="h-4 w-4 text-teal-300" />
                </div>
                <span className="text-sm text-white/80">{f.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 rounded-card border border-white/10 bg-white/5 p-4 font-mono text-[11px] text-white/50">
            TSK-014 · Set up project repository → done
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">{children}</div>
    </div>
  );
}
