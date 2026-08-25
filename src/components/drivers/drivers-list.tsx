"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Eye, Edit, Trash2, Bike, Car, Zap, Wallet, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { Loading } from "@/components/ui/loading"

interface Driver {
  id: string
  fullName: string
  phone: string
  vehicleType: string
  city: string | null
  isApproved: boolean
  isActive: boolean
  isAvailable: boolean
  balance: string
  commissionRate: string
  createdAt: string
  user: { email: string }
}

const vehicleIcons = { BICYCLE: Bike, MOTORCYCLE: Zap, CAR: Car }

export function DriversList() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const res = await fetch("/api/admin/drivers")
      if (res.ok) {
        const data = await res.json()
        setDrivers(data.drivers || [])
      }
    } catch (err) {
      console.error("Error fetching drivers:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Loading text="Cargando domiciliarios..." className="py-16" />
  }

  const activeCount = drivers.filter(d => d.isActive && d.isAvailable).length
  const approvedCount = drivers.filter(d => d.isApproved).length
  const pendingCount = drivers.filter(d => !d.isApproved).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-success">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-primary">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-warning">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="text-xs font-medium">Domiciliario</TableHead>
              <TableHead className="text-xs font-medium">Vehículo</TableHead>
              <TableHead className="text-xs font-medium">Ciudad</TableHead>
              <TableHead className="text-xs font-medium">Estado</TableHead>
              <TableHead className="text-xs font-medium">Saldo</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay domiciliarios registrados
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => {
                const VehicleIcon = vehicleIcons[driver.vehicleType as keyof typeof vehicleIcons] || Zap
                return (
                  <TableRow key={driver.id} className="border-border/60">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={driver.fullName} />
                          <AvatarFallback className="text-xs font-medium">
                            {driver.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{driver.fullName}</div>
                          <div className="text-xs text-muted-foreground">{driver.phone}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <VehicleIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="capitalize">
                          {driver.vehicleType === "MOTORCYCLE" ? "Moto" :
                           driver.vehicleType === "BICYCLE" ? "Bici" :
                           driver.vehicleType === "CAR" ? "Carro" : "Otro"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{driver.city || "-"}</span></TableCell>
                    <TableCell>
                      <Badge variant={driver.isApproved ? (driver.isActive ? "default" : "secondary") : "outline"} className="gap-1 text-[10px]">
                        {driver.isApproved ? (driver.isActive ? "Activo" : "Inactivo") : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">${Number(driver.balance).toLocaleString("es-CO")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Ver perfil</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                          {!driver.isApproved && <DropdownMenuItem className="text-success"><CheckCircle2 className="mr-2 h-4 w-4" />Aprobar</DropdownMenuItem>}
                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Desactivar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
