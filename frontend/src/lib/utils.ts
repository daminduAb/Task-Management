import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats a numeric ID as a mono-font ticket code, e.g. 14 -> "TSK-014"
export function ticketId(id: number, prefix: "TSK" | "PRJ" = "TSK"): string {
  return `${prefix}-${String(id).padStart(3, "0")}`;
}
