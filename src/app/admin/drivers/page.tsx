"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal, 
  UserCheck, 
  UserX,
  Clock,
  Link2
} from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"

interface Driver {
  id: string
  userId: string
  phone: string
  fullName: string
  vehicleType: string
  licensePlate: string | null
  city: string | null
  isAvailable: boolean
  isActive: boolean
  isApproved: boolean
  createdAt: string
  user: {
    email: string
  }
}

export default function AdminDriversPage() {
  const { isAdmin, isLoading: userLoading } = useUser()
  const router = useRouter()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, userLoading, router])

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await fetch("/api/admin/drivers")
      const data = await response.json()
      setDrivers(data.drivers || [])
    } catch (error) {
      console.error("Error fetching drivers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (driverId: string) => {
    setActionLoading(driverId)
    try {
      await fetch(`/api/admin/drivers/${driverId}/approve`, { method: "POST" })
      fetchDrivers()
    } catch (error) {
      console.error("Error approving driver:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleActive = async (driverId: string, isActive: boolean) => {
    setActionLoading(driverId)
    try {
      await fetch(`/api/admin/drivers/${driverId}/toggle-active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      fetchDrivers()
    } catch (error) {
      console.error("Error toggling driver:", error)
    } finally {
      setActionLoading(null)
    }
  }

  if (userLoading || !isAdmin) {
    return (
      <DashboardLayout>
        <Loading fullpage />
      </DashboardLayout>
    )
  }

  const pendingDrivers = drivers.filter(d => !d.isApproved)
  const approvedDrivers = drivers.filter(d => d.isApproved)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domiciliarios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona las solicitudes y cuentas de domiciliarios
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Solicitudes Pendientes ({pendingDrivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingDrivers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay solicitudes pendientes</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Zona</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.fullName}</TableCell>
                      <TableCell>{driver.phone}</TableCell>
                      <TableCell>{driver.vehicleType}</TableCell>
                      <TableCell>{driver.city || "-"}</TableCell>
                      <TableCell>{new Date(driver.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(driver.id)}
                            disabled={actionLoading === driver.id}
                          >
                            {actionLoading === driver.id ? (
                              <Loading text="" className="flex-row gap-2" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            Aprobar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-success" />
              Domiciliarios Aprobados ({approvedDrivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvedDrivers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay domiciliarios aprobados</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Zona</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.fullName}</TableCell>
                      <TableCell>{driver.phone}</TableCell>
                      <TableCell>{driver.vehicleType}</TableCell>
                      <TableCell>{driver.city || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={driver.isActive ? "default" : "secondary"}>
                          {driver.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                const url = `${window.location.origin}/drivers/status?name=${encodeURIComponent(driver.fullName)}`
                                navigator.clipboard.writeText(url)
                              }}
                            >
                              <Link2 className="mr-2 h-4 w-4" />
                              Copiar link de estado
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleActive(driver.id, driver.isActive)}
                            >
                              {driver.isActive ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
