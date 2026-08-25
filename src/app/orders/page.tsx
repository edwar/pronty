"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { OrdersList } from "@/components/orders/orders-list"
import { CreateOrderDialog } from "@/components/orders/create-order-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOrderChannel } from "@/hooks/use-order-channel"
import { Plus, Search, Filter } from "lucide-react"

const EXPIRE_CHECK_INTERVAL = 5 * 60 * 1000 // 5 min para expirar atascados

export default function OrdersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [refreshKey, setRefreshKey] = useState(0)
  const [commerceId, setCommerceId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCommerceId = async () => {
      try {
        const res = await fetch("/api/orders")
        const data = await res.json()
        if (data.commerceId) setCommerceId(data.commerceId)
      } catch {}
    }
    fetchCommerceId()
  }, [])

  const handleOrderUpdate = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  useOrderChannel(commerceId ?? "", handleOrderUpdate)

  // Expirar pedidos atascados cada 5 min (backup del Pusher)
  useEffect(() => {
    const tick = async () => {
      try {
        await fetch("/api/orders/expire-stuck", { method: "POST" })
        setRefreshKey((prev) => prev + 1)
      } catch {}
    }

    const interval = setInterval(tick, EXPIRE_CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const handleOrderCreated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gestiona y solicita los servicios de domicilio de tu negocio</p>
          </div>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)} className="h-9">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por # pedido, destinatario, teléfono o dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="w-full sm:w-[200px]">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "ALL")}>
              <SelectTrigger className="h-9 text-sm">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <SelectValue>
                    {statusFilter === "ALL" ? "Todos los estados" :
                     statusFilter === "PENDING" ? "Pendientes" :
                     statusFilter === "IN_TRANSIT" ? "En entrega / Tránsito" :
                     statusFilter === "DELIVERED" ? "Entregados" :
                     statusFilter === "CANCELLED" ? "Cancelados" : "Filtrar por estado"}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="IN_TRANSIT">En entrega / Tránsito</SelectItem>
                <SelectItem value="DELIVERED">Entregados</SelectItem>
                <SelectItem value="CANCELLED">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <OrdersList
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          refreshKey={refreshKey}
          onOrderUpdated={handleOrderCreated}
        />
      </div>

      <CreateOrderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onOrderCreated={handleOrderCreated}
      />
    </DashboardLayout>
  )
}
