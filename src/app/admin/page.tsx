"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { ActiveDrivers } from "@/components/dashboard/active-drivers"
import { useUser } from "@/hooks/use-user"
import { Loading } from "@/components/ui/loading"

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    // 1. Esperar a que la sesión termine de cargar
    if (isLoading) return

    // 2. Si no hay usuario autenticado, mandar al login
    if (!user) {
      window.location.replace("/login")
      return
    }

    // 3. Si hay usuario pero NO es admin (comercio/driver), mandar al dashboard con reemplazo duro
    if (!isAdmin) {
      window.location.replace("/dashboard")
      return
    }
  }, [user, isAdmin, isLoading])

  // Mientras carga la sesión o si se va a redireccionar a un usuario no admin
  if (isLoading || !user || !isAdmin) {
    return (
      <DashboardLayout>
        <Loading fullpage />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vista general del sistema Pronty
          </p>
        </div>

        <StatsCards />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentOrders />
          </div>
          <div>
            <ActiveDrivers />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}