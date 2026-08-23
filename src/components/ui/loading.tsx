"use client"

import { cn } from "@/lib/utils"

interface LoadingProps {
  text?: string
  fullpage?: boolean
  className?: string
}

const loaderStyles = `
  @keyframes pronty-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pronty-spin-reverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
  @keyframes pronty-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(0.7); }
  }
  @keyframes pronty-dash {
    0% { stroke-dashoffset: 60; }
    50% { stroke-dashoffset: 15; }
    100% { stroke-dashoffset: 60; }
  }
  @keyframes pronty-fade {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .pronty-spin { animation: pronty-spin 1.1s linear infinite; transform-origin: 32px 32px; }
  .pronty-spin-reverse { animation: pronty-spin-reverse 1.6s linear infinite; transform-origin: 32px 32px; }
  .pronty-pulse { animation: pronty-pulse 1.1s ease-in-out infinite; transform-origin: 32px 32px; }
  .pronty-dash { animation: pronty-dash 1.4s ease-in-out infinite; }
  .pronty-fade { animation: pronty-fade 2s ease-in-out infinite; }
`

export function Loading({ text = "Cargando...", fullpage = false, className }: LoadingProps) {
  const spinner = (
    <div className="relative flex items-center justify-center">
      <style>{loaderStyles}</style>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={fullpage ? "size-16" : "size-4"}
      >
        <defs>
          <linearGradient id="pronty-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--primary)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <g className="pronty-spin">
          <circle
            cx="32"
            cy="32"
            r="26"
            stroke="var(--border)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M58 32a26 26 0 0 0-26-26"
            stroke="url(#pronty-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M6 32a26 26 0 0 0 26 26"
            stroke="url(#pronty-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.45"
          />
        </g>
        <g className="pronty-spin-reverse">
          <circle
            cx="32"
            cy="32"
            r="17"
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="8 6"
            fill="none"
            opacity="0.5"
            className="pronty-dash"
          />
        </g>
        <circle
          cx="32"
          cy="32"
          r="6"
          fill="var(--primary)"
          className="pronty-pulse"
        />
      </svg>
    </div>
  )

  const content = (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      {spinner}
      {text && (
        <p className="pronty-fade text-sm font-medium tracking-wide text-muted-foreground">
          {text}
        </p>
      )}
    </div>
  )

  if (fullpage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}
