"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/AuthShell";
import { Eye, EyeOff, Shield, Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@demo.com", icon: Shield, accent: "text-indigo-600 bg-indigo-50" },
  { role: "PM", email: "pm@demo.com", icon: Briefcase, accent: "text-amber-600 bg-amber-50" },
  { role: "Member", email: "member@demo.com", icon: User, accent: "text-teal-600 bg-teal-50" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("password123");
  }

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <h2 className="font-display text-2xl font-semibold">Welcome back</h2>
        <p className="mt-1 text-sm text-muted">Log in to your project workspace.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-priority-high"
            >
              {error}
            </motion.p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Email</label>
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="mt-2 h-11">
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          No account?{" "}
          <Link href="/register" className="font-medium text-accent hover:underline">
            Register
          </Link>
        </p>

        <div className="mt-8 border-t border-border pt-5">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted">
            Try a demo account
          </p>
          <div className="flex flex-col gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email)}
                className={cn(
                  "flex items-center gap-3 rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:border-accent",
                  email === acc.email && "border-accent bg-accent-soft/40"
                )}
              >
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", acc.accent)}>
                  <acc.icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-medium">{acc.role}</div>
                  <div className="font-mono text-[11px] text-muted">{acc.email}</div>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">
            Click a role to autofill, password: <span className="font-mono">password123</span>
          </p>
        </div>
      </motion.div>
    </AuthShell>
  );
}
