import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyRange(min?: number | null, max?: number | null) {
  if (!min && !max) return "Budget da definire";
  if (min && max) return `${min}-${max} euro`;
  if (min) return `Da ${min} euro`;
  return `Fino a ${max} euro`;
}

export type UiGroupRole = "owner" | "member" | "guest";

export function normalizeGroupRole(role?: string | null): UiGroupRole {
  if (role === "owner" || role === "guest") return role;
  return "member";
}

export function initials(name?: string | null) {
  if (!name) return "GL";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
