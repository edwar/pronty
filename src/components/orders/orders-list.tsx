"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Trash2, MapPin, Clock, User, Bike, Loader2, AlertCircle, ShoppingBag } from "lucide-react"
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog"
import { EmptyState } from "@/components/ui/empty-state"


interface OrdersListProps {
  statusFilter?: string
  searchQuery?: string
  refreshKey?: number
  onOrderUpdated?: () => void
}

interface OrderItem {
  id: string
  orderNumber: string
  recipientName: string
  recipientPhone: string
  deliveryAddress: string
  status: string
  totalFee: string | number
  createdAt: string
  driver: {
    fullName: string
    phone: string
  } | null
}

const statusConfig: Record<string, { label: string; variant: "default" | "warning" | "success" | "destructive" | "outline" }> = {
  PENDING: { label: "Pendiente", variant: "warning" },
  ASSIGNING_DIRECT: { label: "Asignando", variant: "default" },
  ASSIGNING_BROADCAST: { label: "Buscando", variant: "default" },
  ACCEPTED: { label: "Aceptado", variant: "default" },
  HEADING_TO_PICKUP: { label: "Hacia recogida", variant: "default" },
  PICKED_UP: { label: "Recogido", variant: "default" },
  IN_TRANSIT: { label: "En Entrega", variant: "default" },
  DELIVERED: { label: "Entregado", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
  EXPIRED: { label: "Expirado", variant: "outline" },
}

export function OrdersList({
  statusFilter = "ALL",
  searchQuery = "",
  refreshKey = 0,
  onOrderUpdated,
}: OrdersListProps) {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Details dialog state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, searchQuery, refreshKey])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter)
      if (searchQuery && searchQuery.trim() !== "") params.append("search", searchQuery.trim())

      const res = await fetch(`/api/orders?${params.toString()}`)
      if (!res.ok) throw new Error("Error al cargar la lista de pedidos")
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err: any) {
      setError(err.message || "Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = (orderId: string) => {
    setSelectedOrderId(orderId)
    setDetailsOpen(true)
  }

  return (
    <>
      <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No se encontraron pedidos"
            description="No hay pedidos registrados con los filtros seleccionados. Intenta cambiar la búsqueda o solicitar un nuevo domicilio."
            className="border-0 bg-transparent py-16"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent bg-muted/20">
                <TableHead className="text-xs font-medium">Pedido</TableHead>
                <TableHead className="text-xs font-medium">Destinatario</TableHead>
                <TableHead className="text-xs font-medium">Entrega</TableHead>
                <TableHead className="text-xs font-medium">Estado</TableHead>
                <TableHead className="text-xs font-medium">Domiciliario</TableHead>
                <TableHead className="text-xs font-medium">Tarifa</TableHead>
                <TableHead className="text-xs font-medium">Fecha</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status = statusConfig[order.status] || { label: order.status, variant: "outline" }
                return (
                  <TableRow key={order.id} className="border-border/60 hover:bg-muted/10 transition-colors">
                    <TableCell>
                      <span className="text-sm font-semibold tracking-tight">{order.orderNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{order.recipientName}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3 shrink-0" />
                          {order.recipientPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[180px]">{order.deliveryAddress}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        {order.driver ? (
                          <>
                            <Bike className="h-3.5 w-3.5 text-primary" />
                            {order.driver.fullName}
                          </>
                        ) : (
                          "Sin asignar"
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">
                        ${Number(order.totalFee).toLocaleString("es-CO")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        {new Date(order.createdAt).toLocaleDateString("es-CO", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDetails(order.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <OrderDetailsDialog
        orderId={selectedOrderId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onOrderUpdated={() => {
          fetchOrders()
          if (onOrderUpdated) onOrderUpdated()
        }}
      />
    </>
  )
}
