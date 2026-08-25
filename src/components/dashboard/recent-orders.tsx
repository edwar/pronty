"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck,
  MapPin,
  Loader2
} from "lucide-react"

interface RecentOrder {
  id: string
  orderNumber: string
  recipientName: string
  deliveryAddress: string
  status: string
  createdAt: string
  driver: { fullName: string } | null
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: "warning" | "default" | "success" | "destructive" }> = {
  PENDING: { label: "Pendiente", icon: Clock, variant: "warning" },
  ASSIGNING_DIRECT: { label: "Asignando", icon: Truck, variant: "default" },
  ASSIGNING_BROADCAST: { label: "Buscando", icon: Truck, variant: "default" },
  ACCEPTED: { label: "Aceptado", icon: CheckCircle2, variant: "default" },
  IN_TRANSIT: { label: "En Camino", icon: Truck, variant: "default" },
  DELIVERED: { label: "Entregado", icon: CheckCircle2, variant: "success" },
  CANCELLED: { label: "Cancelado", icon: XCircle, variant: "destructive" },
  FAILED_DELIVERY: { label: "Falló", icon: XCircle, variant: "destructive" },
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  
  if (diffMin < 1) return "Ahora"
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `Hace ${diffHr}h`
  const diffDay = Math.floor(diffHr / 24)
  return `Hace ${diffDay}d`
}

export function RecentOrders() {
  const [orders, setOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders")
        if (res.ok) {
          const data = await res.json()
          setOrders((data.orders || []).slice(0, 5))
        }
      } catch (err) {
        console.error("Error fetching orders:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-sm font-semibold">Pedidos Recientes</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          <Link href="/orders" className="flex items-center gap-1">
            Ver todos
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No hay pedidos recientes
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING
              const StatusIcon = status.icon
              
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8">
                      <StatusIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{order.orderNumber}</span>
                        <Badge variant={status.variant} className="text-[10px]">
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.recipientName}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {order.deliveryAddress}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(order.createdAt)}</p>
                    {order.driver && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {order.driver.fullName}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
