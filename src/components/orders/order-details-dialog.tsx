"use client"

import { useEffect, useState } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, Phone, User, Bike, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface OrderDetailsDialogProps {
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onOrderUpdated?: () => void
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pendiente", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  ASSIGNING_DIRECT: { label: "Asignando", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Bike },
  ASSIGNING_BROADCAST: { label: "Buscando", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Bike },
  ACCEPTED: { label: "Aceptado", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle2 },
  HEADING_TO_PICKUP: { label: "Hacia recogida", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Bike },
  PICKED_UP: { label: "Recogido", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Bike },
  IN_TRANSIT: { label: "En tránsito", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Bike },
  DELIVERED: { label: "Entregado", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelado", color: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: XCircle },
  EXPIRED: { label: "Expirado", color: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: AlertCircle },
}

export function OrderDetailsDialog({
  orderId,
  open,
  onOpenChange,
  onOrderUpdated,
}: OrderDetailsDialogProps) {
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails(orderId)
    } else {
      setOrder(null)
      setError(null)
    }
  }, [open, orderId])

  const fetchOrderDetails = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (!res.ok) throw new Error("Error al obtener los detalles del pedido")
      const data = await res.json()
      setOrder(data.order)
    } catch (err: any) {
      setError(err.message || "Error al cargar la información")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!orderId) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al cancelar el pedido")
      fetchOrderDetails(orderId)
      if (onOrderUpdated) onOrderUpdated()
    } catch (err: any) {
      setError(err.message || "Error al cancelar el pedido")
    } finally {
      setCancelling(false)
    }
  }

  const currentStatus = order?.status ? statusConfig[order.status] || { label: order.status, color: "", icon: Clock } : null
  const StatusIcon = currentStatus?.icon || Clock

  const canCancel = order && ["PENDING", "ASSIGNING_DIRECT", "ASSIGNING_BROADCAST", "ACCEPTED"].includes(order.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-4">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                Pedido #{order?.orderNumber || "..."}
              </DialogTitle>
              <DialogDescription>
                Detalles y trazabilidad en tiempo real
              </DialogDescription>
            </div>
            {currentStatus && (
              <Badge className={`px-2.5 py-1 flex items-center gap-1.5 border text-xs font-medium ${currentStatus.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {currentStatus.label}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex items-center justify-center text-muted-foreground text-sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando detalles...
          </div>
        ) : error ? (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        ) : order ? (
          <div className="space-y-5 py-2">
            {/* Destinatario */}
            <div className="rounded-lg bg-muted/40 p-3.5 space-y-2 border border-border/60">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destinatario</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" />
                  {order.recipientName}
                </span>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Phone className="h-3.5 w-3.5" />
                  {order.recipientPhone}
                </span>
              </div>
            </div>

            {/* Recogida y Entrega */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 p-3 rounded-lg border border-border/60">
                <p className="font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Recogida
                </p>
                <p className="font-medium text-foreground">{order.pickupAddress}</p>
                {order.pickupNotes && <p className="text-muted-foreground italic">"{order.pickupNotes}"</p>}
              </div>

              <div className="space-y-1 p-3 rounded-lg border border-border/60">
                <p className="font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Entrega
                </p>
                <p className="font-medium text-foreground">{order.deliveryAddress}</p>
                {order.deliveryNotes && <p className="text-muted-foreground italic">"{order.deliveryNotes}"</p>}
              </div>
            </div>

            {/* Domiciliario y Tarifa */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border/60 space-y-1">
                <p className="text-muted-foreground font-medium flex items-center gap-1">
                  <Bike className="h-3.5 w-3.5 text-primary" /> Domiciliario
                </p>
                <p className="font-semibold text-foreground">
                  {order.driver ? order.driver.fullName : "Sin asignar"}
                </p>
                {order.driver?.phone && <p className="text-muted-foreground">{order.driver.phone}</p>}
              </div>

              <div className="p-3 rounded-lg border border-border/60 space-y-1">
                <p className="text-muted-foreground font-medium">Tarifa del Servicio</p>
                <p className="text-lg font-bold text-primary">
                  ${Number(order.totalFee).toLocaleString("es-CO")}
                </p>
              </div>
            </div>

            {/* Trazabilidad (Timeline) */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Línea de Tiempo</h4>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {order.statusLogs?.map((log: any, idx: number) => (
                  <div key={log.id || idx} className="flex items-start gap-2.5 text-xs pb-2 border-b border-border/40 last:border-0">
                    <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{log.note || `Cambio de estado: ${log.to}`}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("es-CO", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          {canCancel ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelOrder}
              disabled={cancelling || loading}
            >
              {cancelling ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <XCircle className="mr-1.5 h-3.5 w-3.5" />}
              Cancelar Pedido
            </Button>
          ) : (
            <div />
          )}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
