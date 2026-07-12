"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading || !user) {
    return <p className="p-10 text-muted">Loading...</p>;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
