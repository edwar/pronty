"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DriversList } from "@/components/drivers/drivers-list"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { useUser } from "@/hooks/use-user"

export default function DriversPage() {
  const { isAdmin } = useUser()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Domiciliarios</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdmin ? "Gestiona todos los domiciliarios del sistema" : "Gestiona tu equipo de delivery"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filtros
            </Button>
          </div>
        </div>

        <DriversList />
      </div>
    </DashboardLayout>
  )
}
