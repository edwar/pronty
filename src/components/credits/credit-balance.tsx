"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, TrendingUp, TrendingDown, ShoppingBag } from "lucide-react"

const stats = [
  {
    label: "Saldo Actual",
    value: "156",
    subtitle: "créditos disponibles",
    icon: CreditCard,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Comprados",
    value: "200",
    subtitle: "este mes",
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    label: "Consumidos",
    value: "44",
    subtitle: "envíos realizados",
    icon: TrendingDown,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    label: "Último Paquete",
    value: "50",
    subtitle: "paquete profesional",
    icon: ShoppingBag,
    color: "text-warning",
    bg: "bg-warning/10",
  },
]

export function CreditBalance() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/60 transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold leading-tight ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
