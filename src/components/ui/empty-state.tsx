"use client"

import React from "react"
import { Inbox, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
  compact?: boolean
}

export function EmptyState({
  title = "No hay registros disponibles",
  description = "No se encontraron datos para mostrar en este momento.",
  icon: Icon = Inbox,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 transition-colors",
        compact ? "py-8 px-4" : "py-14 px-6",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3.5 shadow-sm border border-border/40">
        <Icon className="h-6 w-6 stroke-[1.5]" />
      </div>

      <h3 className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
