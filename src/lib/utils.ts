import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseNumericInput(raw: string): number {
  const cleaned = raw.replace(/^0+(?=\d)/, "")
  return Number(cleaned) || 0
}
