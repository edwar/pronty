"use client"

import { useId } from "react"

interface LogoProps {
  className?: string
  variant?: "full" | "icon"
}

function ScooterMark({ className, gradientId }: { className?: string; gradientId: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-label="Pronty">
      <rect width="48" height="48" rx="14" fill={`url(#${gradientId})`} />
      <g
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M26 14h4" />
        <path d="M30 14l4 20" />
        <path d="M14 34h4l3-5h12" />
        <circle cx="14" cy="34" r="4" />
        <circle cx="34" cy="34" r="4" />
      </g>
      <rect x="9" y="17" width="10" height="9" rx="2.5" fill="white" />
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function Logo({ className, variant = "full" }: LogoProps) {
  const gradientId = useId().replace(/:/g, "")

  if (variant === "icon") {
    return <ScooterMark className={className} gradientId={gradientId} />
  }

  return (
    <span className="flex items-center gap-2.5">
      <ScooterMark className={`h-8 w-8 ${className ?? ""}`} gradientId={gradientId} />
      <span className="text-lg font-bold tracking-tight text-foreground">Pronty</span>
    </span>
  )
}
