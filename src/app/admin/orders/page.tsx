"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Store,
  Bike,
  User,
  MapPin,
  Banknote,
} from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"

interface AdminOrder {
  id: string
  orderNumber: string
  status: string
  baseFee: string
  commissionFee: string | null
  totalFee: string
  recipientName: string
  recipientPhone: string
  pickupAddress: string
  deliveryAddress: string
  packageDescription: string | null
  assignmentType: string
  createdAt: string
  deliveredAt: string | null
  cancelledAt: string | null
  commerce: {
    id: string
    name: string
  }
  driver: {
    id: string
    fullName: string
    phone: string
  } | null
}

const statusConfig: Record<string, { label: string; badgeClass: string; icon: typeof Clock }> = {
  PENDING: { label: "Pendiente", badgeClass: "bg-muted text-muted-foreground", icon: Clock },
  ASSIGNING_DIRECT: { label: "Asignando", badgeClass: "bg-primary/10 text-primary", icon: Clock },
  ASSIGNING_BROADCAST: { label: "Buscando domiciliario", badgeClass: "bg-primary/10 text-primary", icon: Clock },
  ACCEPTED: { label: "Aceptado", badgeClass: "bg-primary/10 text-primary", icon: Truck },
  HEADING_TO_PICKUP: { label: "Rumbo a recoger", badgeClass: "bg-primary/10 text-primary", icon: Truck },
  PICKED_UP: { label: "Recogido", badgeClass: "bg-primary/10 text-primary", icon: Truck },
  IN_TRANSIT: { label: "En camino", badgeClass: "bg-primary/10 text-primary", icon: Truck },
  DELIVERED: { label: "Entregado", badgeClass: "bg-success/10 text-success", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelado", badgeClass: "bg-destructive/10 text-destructive", icon: XCircle },
  EXPIRED: { label: "Expirado", badgeClass: "bg-muted text-muted-foreground", icon: XCircle },
}

const filters = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "IN_PROGRESS", label: "En proceso" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "CANCELLED", label: "Cancelados" },
]

const inProgressStatuses = [
  "ASSIGNING_DIRECT",
  "ASSIGNING_BROADCAST",
  "ACCEPTED",
  "HEADING_TO_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
]

export default function AdminOrdersPage() {
  const { isAdmin, isLoading: userLoading } = useUser()
  const router = useRouter()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, userLoading, router])

  useEffect(() => {
    fetchOrders()
  }, [])

  // Expirar pedidos atascados y refrescar cada 30s
  useEffect(() => {
    const tick = async () => {
      try {
        await fetch("/api/admin/orders/expire-stuck", { method: "POST" })
      } catch {}
      fetchOrders()
    }

    const interval = setInterval(tick, 30_000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders")
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error("Error fetching orders:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "PENDING" && o.status === "PENDING") ||
        (filter === "IN_PROGRESS" && inProgressStatuses.includes(o.status)) ||
        (filter === "DELIVERED" && o.status === "DELIVERED") ||
        (filter === "CANCELLED" && ["CANCELLED", "EXPIRED"].includes(o.status))
      const term = search.toLowerCase()
      const matchesSearch =
        !term ||
        o.orderNumber.toLowerCase().includes(term) ||
        o.recipientName.toLowerCase().includes(term) ||
        o.commerce.name.toLowerCase().includes(term) ||
        (o.driver?.fullName.toLowerCase().includes(term) ?? false)
      return matchesFilter && matchesSearch
    })
  }, [orders, filter, search])

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      inProgress: orders.filter((o) => inProgressStatuses.includes(o.status)).length,
      delivered: orders.filter((o) => o.status === "DELIVERED").length,
      cancelled: orders.filter((o) => ["CANCELLED", "EXPIRED"].includes(o.status)).length,
    }
  }, [orders])

  const filterCounts = useMemo(() => {
    return {
      ALL: stats.total,
      PENDING: stats.pending,
      IN_PROGRESS: stats.inProgress,
      DELIVERED: stats.delivered,
      CANCELLED: stats.cancelled,
    }
  }, [stats])

  if (userLoading || !isAdmin) {
    return (
      <DashboardLayout>
        <Loading fullpage />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Todos los pedidos de la plataforma
            </p>
          </div>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar pedido..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-5">
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stats.total}</p>
                <p className="mt-1 text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stats.pending}</p>
                <p className="mt-1 text-xs text-muted-foreground">Pendientes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stats.inProgress}</p>
                <p className="mt-1 text-xs text-muted-foreground">En proceso</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stats.delivered}</p>
                <p className="mt-1 text-xs text-muted-foreground">Entregados</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stats.cancelled}</p>
                <p className="mt-1 text-xs text-muted-foreground">Cancelados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                  filter === f.value ? "bg-primary-foreground/20" : "bg-muted"
                )}
              >
                {filterCounts[f.value as keyof typeof filterCounts]}
              </span>
            </Button>
          ))}
        </div>

        <Card className="border-border/60">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loading text="Cargando pedidos..." />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium">No se encontraron pedidos</p>
                <p className="text-xs text-muted-foreground">
                  {search ? "Intenta con otra búsqueda" : "No hay pedidos con este filtro"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Pedido</TableHead>
                    <TableHead>Comercio</TableHead>
                    <TableHead>Domiciliario</TableHead>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="pr-6">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const status = statusConfig[order.status] ?? statusConfig.PENDING
                    const StatusIcon = status.icon

                    return (
                      <TableRow key={order.id} className="border-b border-border/40">
                        <TableCell className="pl-6">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              #{order.orderNumber}
                            </p>
                            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-48">
                                {order.pickupAddress} → {order.deliveryAddress}
                              </span>
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate max-w-32">{order.commerce.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.driver ? (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Bike className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="truncate max-w-32">{order.driver.fullName}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin asignar</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1 truncate text-sm">
                              <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              {order.recipientName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {order.recipientPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Banknote className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-semibold">
                              ${Number(order.totalFee).toLocaleString("es-CO")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1", status.badgeClass)}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6">
                          <div className="text-right">
                            <p className="text-sm">
                              {new Date(order.createdAt).toLocaleDateString("es-CO", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString("es-CO", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
