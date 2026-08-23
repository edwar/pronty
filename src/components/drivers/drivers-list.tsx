"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Eye, Edit, Trash2, Bike, Car, Zap, Wallet, CheckCircle2, Clock } from "lucide-react"

const drivers = [
  { id: "DRV-001", name: "Carlos Mendoza", phone: "+57 300 123 4567", vehicle: "MOTORCYCLE", zone: "Centro", isApproved: true, balance: "$45.000", deliveries: 12, status: "active" },
  { id: "DRV-002", name: "Ana Pérez", phone: "+57 301 234 5678", vehicle: "BICYCLE", zone: "Norte", isApproved: true, balance: "$32.000", deliveries: 8, status: "on_delivery" },
  { id: "DRV-003", name: "Luis Ramírez", phone: "+57 302 345 6789", vehicle: "MOTORCYCLE", zone: "Sur", isApproved: true, balance: "$67.500", deliveries: 15, status: "active" },
  { id: "DRV-004", name: "María García", phone: "+57 303 456 7890", vehicle: "CAR", zone: "Centro", isApproved: false, balance: "$0", deliveries: 0, status: "pending" },
]

const vehicleIcons = { BICYCLE: Bike, MOTORCYCLE: Zap, CAR: Car }
const statusConfig = {
  active: { label: "Activo", variant: "success" as const, icon: CheckCircle2 },
  on_delivery: { label: "En Entrega", variant: "default" as const, icon: Zap },
  pending: { label: "Pendiente", variant: "warning" as const, icon: Clock },
}

export function DriversList() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{drivers.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-success">{drivers.filter(d => d.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-primary">{drivers.filter(d => d.status === "on_delivery").length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-warning">{drivers.filter(d => d.status === "pending").length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="text-xs font-medium">Domiciliario</TableHead>
              <TableHead className="text-xs font-medium">Vehículo</TableHead>
              <TableHead className="text-xs font-medium">Zona</TableHead>
              <TableHead className="text-xs font-medium">Estado</TableHead>
              <TableHead className="text-xs font-medium">Balance</TableHead>
              <TableHead className="text-xs font-medium">Entregas</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => {
              const VehicleIcon = vehicleIcons[driver.vehicle as keyof typeof vehicleIcons]
              const status = statusConfig[driver.status as keyof typeof statusConfig]
              const StatusIcon = status.icon
              return (
                <TableRow key={driver.id} className="border-border/60">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={driver.name} />
                        <AvatarFallback className="text-xs font-medium">{driver.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{driver.name}</div>
                        <div className="text-xs text-muted-foreground">{driver.phone}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <VehicleIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="capitalize">{driver.vehicle.toLowerCase() === "motorcycle" ? "Motocicleta" : driver.vehicle.toLowerCase() === "bicycle" ? "Bicicleta" : "Carro"}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{driver.zone}</span></TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="gap-1 text-[10px]">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{driver.balance}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm font-medium">{driver.deliveries}</span></TableCell>
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
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
