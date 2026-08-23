"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { OrdersList } from "@/components/orders/orders-list"
import { CreateOrderDialog } from "@/components/orders/create-order-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"

export default function OrdersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gestiona los pedidos de tu negocio</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filtros
            </Button>
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nuevo Pedido
            </Button>
          </div>
        </div>

        <OrdersList />
      </div>

      <CreateOrderDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </DashboardLayout>
  )
}
