"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bike, Car, Zap } from "lucide-react"

const activeDrivers = [
  {
    id: "DRV-001",
    name: "Carlos Mendoza",
    vehicle: "MOTORCYCLE",
    status: "available",
    deliveries: 12,
  },
  {
    id: "DRV-002",
    name: "Ana Pérez",
    vehicle: "BICYCLE",
    status: "on_delivery",
    deliveries: 8,
  },
  {
    id: "DRV-003",
    name: "Luis Ramírez",
    vehicle: "MOTORCYCLE",
    status: "available",
    deliveries: 15,
  },
  {
    id: "DRV-004",
    name: "María García",
    vehicle: "CAR",
    status: "on_delivery",
    deliveries: 6,
  },
]

const vehicleIcons = {
  BICYCLE: Bike,
  MOTORCYCLE: Zap,
  CAR: Car,
}

const statusConfig = {
  available: { label: "Disponible", variant: "success" as const },
  on_delivery: { label: "En Entrega", variant: "default" as const },
  offline: { label: "Offline", variant: "secondary" as const },
}

export function ActiveDrivers() {
  return (
    <Card className="border-border/60">
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-semibold">Domiciliarios Activos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/60">
          {activeDrivers.map((driver) => {
            const VehicleIcon = vehicleIcons[driver.vehicle as keyof typeof vehicleIcons]
            const status = statusConfig[driver.status as keyof typeof statusConfig]
            
            return (
              <div
                key={driver.id}
                className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt={driver.name} />
                  <AvatarFallback className="text-xs font-medium">
                    {driver.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{driver.name}</span>
                    <Badge variant={status.variant} className="text-[10px] ml-2 shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <VehicleIcon className="h-3 w-3" />
                    <span>{driver.deliveries} entregas hoy</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
