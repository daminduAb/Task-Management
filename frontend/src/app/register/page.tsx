"use client";

import { useState, useMemo, FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/AuthShell";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { getPasswordStrength } from "@/lib/password";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const requirements = [
    { key: "length", label: "8+ characters" },
    { key: "uppercase", label: "Uppercase letter" },
    { key: "lowercase", label: "Lowercase letter" },
    { key: "number", label: "Number" },
    { key: "special", label: "Special character" },
  ] as const;

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <h2 className="font-display text-2xl font-semibold">Create your account</h2>
        <p className="mt-1 text-sm text-muted">The first account created becomes Admin.</p>

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
            <label className="mb-1 block text-xs font-medium text-muted">Full name</label>
            <Input placeholder="Jane Cooper" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

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

          <AnimatePresence>
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-1.5 flex-1 gap-1 rounded-full bg-border">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className={cn(
                          "h-full flex-1 rounded-full",
                          i < strength.score ? strength.color : "bg-transparent"
                        )}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        style={{ transformOrigin: "left" }}
                      />
                    ))}
                  </div>
                  <span
                    className={cn(
                      "w-12 shrink-0 text-right text-xs font-medium",
                      strength.score === 1 && "text-priority-high",
                      strength.score === 2 && "text-priority-medium",
                      strength.score === 3 && "text-accent",
                      strength.score === 4 && "text-priority-low"
                    )}
                  >
                    {strength.label}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                  {requirements.map((req) => {
                    const met = strength.checks[req.key];
                    return (
                      <div
                        key={req.key}
                        className={cn(
                          "flex items-center gap-1 text-[11px] transition-colors",
                          met ? "text-priority-low" : "text-muted"
                        )}
                      >
                        {met ? (
                          <Check className="h-3 w-3 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 shrink-0 opacity-40" />
                        )}
                        {req.label}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Confirm password</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "pr-10",
                  touched && passwordsMismatch && "border-priority-high focus-visible:ring-priority-high",
                  passwordsMatch && "border-priority-low focus-visible:ring-priority-low"
                )}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {confirmPassword.length > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex items-center gap-1 text-xs",
                  passwordsMatch ? "text-priority-low" : "text-priority-high"
                )}
              >
                {passwordsMatch ? (
                  <>
                    <Check className="h-3 w-3" /> Passwords match
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3" /> Passwords do not match
                  </>
                )}
              </motion.p>
            )}
          </AnimatePresence>

          <Button type="submit" disabled={loading} className="mt-2 h-11">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
