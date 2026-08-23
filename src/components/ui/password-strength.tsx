"use client"

import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password: string
  confirmPassword?: string
  className?: string
}

const rules = [
  { label: "8+ caracteres", check: (p: string) => p.length >= 8 },
  { label: "Una mayúscula", check: (p: string) => /[A-Z]/.test(p) },
  { label: "Una minúscula", check: (p: string) => /[a-z]/.test(p) },
  { label: "Un número", check: (p: string) => /\d/.test(p) },
  { label: "Un carácter especial", check: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
]

export function PasswordStrength({ password, confirmPassword, className }: PasswordStrengthProps) {
  const allRules = [
    ...rules,
    {
      label: "Las contraseñas coinciden",
      check: (p: string) => p === confirmPassword && (confirmPassword?.length ?? 0) > 0,
    },
  ]

  return (
    <div className={cn("rounded-lg border border-border/60 p-3 space-y-2", className)}>
      <p className="text-xs font-medium text-muted-foreground">Requisitos de la contraseña:</p>
      <div className="grid grid-cols-2 gap-1.5">
        {allRules.map((rule) => (
          <div key={rule.label} className="flex items-center gap-1.5">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full",
              rule.check(password || "") ? "bg-success" : "bg-muted-foreground/30"
            )} />
            <span className={cn(
              "text-xs",
              rule.check(password || "") ? "text-success" : "text-muted-foreground"
            )}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
