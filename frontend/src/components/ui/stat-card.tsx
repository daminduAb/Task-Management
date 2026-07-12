"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accentClass = "bg-accent-soft text-accent-dark",
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accentClass?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-card border border-border bg-surface p-4 shadow-card"
    >
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accentClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display text-2xl font-semibold leading-none">{value}</div>
          <div className="mt-1 text-xs text-muted">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}
