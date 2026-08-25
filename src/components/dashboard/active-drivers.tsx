"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bike, Car, Zap, Loader2 } from "lucide-react"

interface ActiveDriver {
  id: string
  fullName: string
  vehicleType: string
  isActive: boolean
  isAvailable: boolean
}

const vehicleIcons = {
  BICYCLE: Bike,
  MOTORCYCLE: Zap,
  CAR: Car,
}

export function ActiveDrivers() {
  const [drivers, setDrivers] = useState<ActiveDriver[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch("/api/admin/drivers")
        if (res.ok) {
          const data = await res.json()
          const activeDrivers = (data.drivers || []).filter(
            (d: ActiveDriver) => d.isActive && d.isAvailable
          )
          setDrivers(activeDrivers)
        }
      } catch (err) {
        console.error("Error fetching drivers:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDrivers()
  }, [])

  return (
    <Card className="border-border/60">
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-semibold">Domiciliarios Activos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : drivers.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No hay domiciliarios activos
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {drivers.map((driver) => {
              const VehicleIcon = vehicleIcons[driver.vehicleType as keyof typeof vehicleIcons] || Zap
              return (
                <div
                  key={driver.id}
                  className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt={driver.fullName} />
                    <AvatarFallback className="text-xs font-medium">
                      {driver.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{driver.fullName}</span>
                      <Badge variant="default" className="text-[10px] ml-2 shrink-0">
                        Disponible
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <VehicleIcon className="h-3 w-3" />
                      <span>
                        {driver.vehicleType === "MOTORCYCLE" ? "Moto" :
                         driver.vehicleType === "BICYCLE" ? "Bici" :
                         driver.vehicleType === "CAR" ? "Carro" : "Otro"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
