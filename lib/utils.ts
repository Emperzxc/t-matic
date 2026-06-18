import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(nameOrEmail: string) {
  const source = nameOrEmail.trim();
  const parts = source.includes("@")
    ? source.split("@")[0].split(/[._-]/)
    : source.split(/\s+/);

  return parts
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
