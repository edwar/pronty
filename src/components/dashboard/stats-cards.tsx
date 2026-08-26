"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ShoppingBag, 
  Users, 
  CreditCard, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react"

interface Stats {
  ordersToday: number
  activeDrivers: number
  credits: number
  monthRevenue: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, driversRes, settingsRes, metricsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/admin/drivers"),
          fetch("/api/settings"),
          fetch("/api/commerce/metrics"),
        ])
        
        const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] }
        const driversData = driversRes.ok ? await driversRes.json() : { drivers: [] }
        const settingsData = settingsRes.ok ? await settingsRes.json() : { commerce: null }
        const metricsData = metricsRes.ok ? await metricsRes.json() : {}
        
        const today = new Date().toDateString()
        const ordersToday = (ordersData.orders || []).filter(
          (o: { createdAt: string }) => new Date(o.createdAt).toDateString() === today
        ).length
        
        const activeDrivers = (driversData.drivers || []).filter(
          (d: { isActive: boolean; isAvailable: boolean }) => d.isActive && d.isAvailable
        ).length

        setStats({
          ordersToday,
          activeDrivers,
          credits: settingsData.commerce?.credits || 0,
          monthRevenue: metricsData.revenue || 0,
        })
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Pedidos Hoy",
      value: stats?.ordersToday || 0,
      icon: ShoppingBag,
    },
    {
      title: "Domiciliarios Activos",
      value: stats?.activeDrivers || 0,
      icon: Users,
    },
    {
      title: "Créditos Disponibles",
      value: stats?.credits || 0,
      icon: CreditCard,
    },
    {
      title: "Ingresos del Mes",
      value: `$${(stats?.monthRevenue || 0).toLocaleString("es-CO")}`,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{card.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
