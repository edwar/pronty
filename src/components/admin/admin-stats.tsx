"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Users, ShoppingBag, CreditCard, TrendingUp } from "lucide-react"

const stats = [
  { title: "Comercios Activos", value: "24", change: "+3", trend: "up", icon: Store, description: "este mes" },
  { title: "Domiciliarios", value: "67", change: "+12", trend: "up", icon: Users, description: "este mes" },
  { title: "Pedidos Totales", value: "1,234", change: "+18%", trend: "up", icon: ShoppingBag, description: "vs. mes anterior" },
  { title: "Ingresos", value: "$45.6M", change: "+22%", trend: "up", icon: CreditCard, description: "vs. mes anterior" },
]

export function AdminStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
              <p className="mt-1 flex items-center text-xs text-muted-foreground">
                <span className="font-medium text-success">{stat.change}</span>
                <span className="ml-1.5">{stat.description}</span>
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
