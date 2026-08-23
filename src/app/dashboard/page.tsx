"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ShoppingBag,
  CheckCircle2,
  CreditCard,
  Star,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

interface MetricsData {
  summary: {
    totalOrders: number
    todayOrders: number
    weekOrders: number
    monthOrders: number
    deliveredOrders: number
    cancelledOrders: number
    totalRevenue: number
    monthRevenue: number
    averageRating: number
    totalRatings: number
    credits: number
  }
  series: { date: string; label: string; orders: number; revenue: number }[]
  recentOrders: {
    id: string
    orderNumber: string
    status: string
    totalFee: string
    createdAt: string
    driver: { fullName: string } | null
    rating: { rating: number } | null
  }[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "text-muted-foreground" },
  ASSIGNING_DIRECT: { label: "Asignando", color: "text-primary" },
  ASSIGNING_BROADCAST: { label: "Buscando", color: "text-primary" },
  ACCEPTED: { label: "Aceptado", color: "text-primary" },
  HEADING_TO_PICKUP: { label: "En camino", color: "text-primary" },
  PICKED_UP: { label: "Recogido", color: "text-primary" },
  IN_TRANSIT: { label: "En tránsito", color: "text-primary" },
  DELIVERED: { label: "Entregado", color: "text-success" },
  CANCELLED: { label: "Cancelado", color: "text-destructive" },
  EXPIRED: { label: "Expirado", color: "text-muted-foreground" },
}

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)

const OrdersChart = dynamic(() => import("@/components/dashboard/orders-chart"), {
  ssr: false,
  loading: () => <Loading />,
})

export default function DashboardPage() {
  const { isAdmin, isLoading } = useUser()
  const router = useRouter()
  const [data, setData] = useState<MetricsData | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (isAdmin) {
      router.replace("/admin")
      return
    }
    fetchMetrics()
  }, [isLoading, isAdmin, router])

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/commerce/metrics")
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error("Error fetching metrics:", err)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading fullpage />
      </DashboardLayout>
    )
  }

  if (isAdmin) {
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen de tu negocio de delivery
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Hoy
                </p>
                <p className="text-2xl font-bold text-primary">{summary?.todayOrders ?? 0}</p>
                <p className="text-xs text-muted-foreground">pedidos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Mes
                </p>
                <p className="text-2xl font-bold text-success">{summary?.monthOrders ?? 0}</p>
                <p className="text-xs text-muted-foreground">pedidos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Ingresos mes
                </p>
                <p className="text-lg font-bold text-warning">
                  {formatCOP(summary?.monthRevenue ?? 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Créditos
                </p>
                <p className="text-2xl font-bold text-primary">{summary?.credits ?? 0}</p>
                <p className="text-xs text-muted-foreground">disponibles</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/60 lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Pedidos por día
              </CardTitle>
              <CardDescription>Últimos 14 días</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersChart data={data?.series ?? []} />
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4 text-warning" />
                Calificación
              </CardTitle>
              <CardDescription>De tus domiciliarios</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-5xl font-bold text-primary">
                {summary?.averageRating ? summary.averageRating.toFixed(1) : "—"}
              </div>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= Math.round(summary?.averageRating ?? 0)
                        ? "fill-warning text-warning"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {summary?.totalRatings ?? 0} calificaciones
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Últimos pedidos</CardTitle>
              <CardDescription>Los 10 pedidos más recientes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/orders")}>
              Ver todos
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="pl-5 text-xs font-medium uppercase tracking-wider">
                    Pedido
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider">
                    Domiciliario
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider">
                    Total
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider">
                    Estado
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider">
                    Calificación
                  </TableHead>
                  <TableHead className="pr-5 text-right text-xs font-medium uppercase tracking-wider">
                    Fecha
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.recentOrders?.map((order) => {
                  const status = statusConfig[order.status] ?? statusConfig.PENDING
                  return (
                    <TableRow key={order.id} className="border-border/40">
                      <TableCell className="pl-5">
                        <span className="text-sm font-medium">#{order.orderNumber}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {order.driver?.fullName ?? "Sin asignar"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          {formatCOP(Number(order.totalFee))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]", status.color)}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                            <span className="text-sm font-medium">{order.rating.rating}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
