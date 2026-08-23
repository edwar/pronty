"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Banknote,
  Package,
  Percent,
  CreditCard,
  Store,
  Bike,
  TrendingUp,
} from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"

interface ReportData {
  summary: {
    totalOrders: number
    totalRevenue: number
    totalCommissions: number
    creditsSold: number
    pendingPayouts: number
    activeCommerces: number
    activeDrivers: number
  }
  series: { date: string; label: string; orders: number; revenue: number }[]
  topCommerces: { id: string; name: string; orders: number; revenue: number }[]
  topDrivers: { id: string; name: string; orders: number; earnings: number }[]
}

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)

const formatCompact = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)

export default function AdminReportsPage() {
  const { isAdmin, isLoading: userLoading } = useUser()
  const router = useRouter()
  const [data, setData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, userLoading, router])

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/admin/reports")
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error("Error fetching reports:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (userLoading || !isAdmin) {
    return (
      <DashboardLayout>
        <Loading fullpage />
      </DashboardLayout>
    )
  }

  const summary = data?.summary

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Métricas y rendimiento de los últimos 30 días
          </p>
        </div>

        {isLoading ? (
          <Loading text="Generando reportes..." className="py-16" />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/60">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold leading-tight">
                      {formatCompact(summary?.totalRevenue ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Ingresos totales</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <Package className="h-5 w-5 text-success" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold leading-tight">
                      {summary?.totalOrders ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Pedidos entregados</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <Percent className="h-5 w-5 text-warning" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold leading-tight">
                      {formatCompact(summary?.totalCommissions ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Comisiones generadas</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold leading-tight">
                      {summary?.creditsSold ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Créditos vendidos</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Ingresos por día
                  </CardTitle>
                  <CardDescription>Últimos 30 días (pedidos entregados)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data?.series ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                        interval={4}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => formatCompact(v)}
                        width={48}
                      />
                      <Tooltip
                        formatter={(value) => [formatCOP(Number(value ?? 0)), "Ingresos"]}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          fontSize: 12,
                          background: "var(--popover)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-4 w-4 text-success" />
                    Pedidos por día
                  </CardTitle>
                  <CardDescription>Últimos 30 días</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data?.series ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                        interval={4}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        width={32}
                      />
                      <Tooltip
                        formatter={(value) => [Number(value ?? 0), "Pedidos"]}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          fontSize: 12,
                          background: "var(--popover)",
                        }}
                      />
                      <Bar
                        dataKey="orders"
                        fill="var(--success)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={18}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Store className="h-4 w-4 text-primary" />
                    Top comercios
                  </CardTitle>
                  <CardDescription>Por ingresos generados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data?.topCommerces.length ? (
                    data.topCommerces.map((commerce, index) => {
                      const maxRevenue = data.topCommerces[0]?.revenue ?? 1
                      const pct = Math.round((commerce.revenue / maxRevenue) * 100)
                      return (
                        <div key={commerce.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 font-medium">
                              <span
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded text-xs font-bold",
                                  index === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                )}
                              >
                                {index + 1}
                              </span>
                              <span className="truncate max-w-40">{commerce.name}</span>
                            </span>
                            <span className="text-muted-foreground">
                              {formatCompact(commerce.revenue)} · {commerce.orders} pedidos
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin datos todavía</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bike className="h-4 w-4 text-success" />
                    Top domiciliarios
                  </CardTitle>
                  <CardDescription>Por pedidos entregados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data?.topDrivers.length ? (
                    data.topDrivers.map((driver, index) => {
                      const maxOrders = data.topDrivers[0]?.orders ?? 1
                      const pct = Math.round((driver.orders / maxOrders) * 100)
                      return (
                        <div key={driver.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 font-medium">
                              <span
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded text-xs font-bold",
                                  index === 0 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                                )}
                              >
                                {index + 1}
                              </span>
                              <span className="truncate max-w-40">{driver.name}</span>
                            </span>
                            <span className="text-muted-foreground">
                              {driver.orders} pedidos · {formatCompact(driver.earnings)}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-success"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin datos todavía</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
