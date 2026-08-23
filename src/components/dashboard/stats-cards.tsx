"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ShoppingBag, 
  Users, 
  CreditCard, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

const stats = [
  {
    title: "Pedidos Hoy",
    value: "24",
    change: "+12%",
    trend: "up",
    icon: ShoppingBag,
    description: "vs. ayer",
  },
  {
    title: "Domiciliarios Activos",
    value: "8",
    change: "+2",
    trend: "up",
    icon: Users,
    description: "en línea",
  },
  {
    title: "Créditos Disponibles",
    value: "156",
    change: "-24",
    trend: "down",
    icon: CreditCard,
    description: "consumidos hoy",
  },
  {
    title: "Ingresos del Mes",
    value: "$2,450",
    change: "+18%",
    trend: "up",
    icon: TrendingUp,
    description: "vs. mes anterior",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight
        
        return (
          <Card key={stat.title} className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
              <p className="mt-1 flex items-center text-xs text-muted-foreground">
                <span className={`flex items-center gap-0.5 font-medium ${
                  stat.trend === "up" ? "text-success" : "text-destructive"
                }`}>
                  <TrendIcon className="h-3 w-3" />
                  {stat.change}
                </span>
                <span className="ml-1.5">{stat.description}</span>
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
