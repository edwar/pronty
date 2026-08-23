"use client"

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
  MapPin
} from "lucide-react"

const recentOrders = [
  {
    id: "ORD-001",
    recipient: "María García",
    delivery: "Calle 12 #45-67",
    status: "IN_TRANSIT",
    time: "Hace 5 min",
    driver: "Carlos M.",
  },
  {
    id: "ORD-002",
    recipient: "Juan López",
    delivery: "Av. Principal #89-12",
    status: "DELIVERED",
    time: "Hace 15 min",
    driver: "Ana P.",
  },
  {
    id: "ORD-003",
    recipient: "Pedro Martínez",
    delivery: "Calle 5 #23-45",
    status: "PENDING",
    time: "Hace 2 min",
    driver: null,
  },
  {
    id: "ORD-004",
    recipient: "Laura Sánchez",
    delivery: "Carrera 8 #34-56",
    status: "ASSIGNING",
    time: "Hace 1 min",
    driver: null,
  },
]

const statusConfig = {
  PENDING: { label: "Pendiente", icon: Clock, variant: "warning" as const },
  ASSIGNING: { label: "Asignando", icon: Truck, variant: "default" as const },
  IN_TRANSIT: { label: "En Camino", icon: Truck, variant: "default" as const },
  DELIVERED: { label: "Entregado", icon: CheckCircle2, variant: "success" as const },
  CANCELLED: { label: "Cancelado", icon: XCircle, variant: "destructive" as const },
}

export function RecentOrders() {
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
        <div className="divide-y divide-border/60">
          {recentOrders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig]
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
                      <span className="text-sm font-medium">{order.id}</span>
                      <Badge variant={status.variant} className="text-[10px]">
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.recipient}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {order.delivery}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{order.time}</p>
                  {order.driver && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {order.driver}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
