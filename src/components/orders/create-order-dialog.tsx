"use client"

import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { NumberInput } from "@/components/ui/number-input"
import { Loader2, AlertCircle } from "lucide-react"

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOrderCreated?: () => void
}

interface Driver {
  id: string
  fullName: string
  vehicleType: string
}

export function CreateOrderDialog({ open, onOpenChange, onOrderCreated }: CreateOrderDialogProps) {
  const [assignmentType, setAssignmentType] = useState<"DIRECT" | "BROADCAST">("DIRECT")
  const [driverId, setDriverId] = useState<string>("")
  const [drivers, setDrivers] = useState<Driver[]>([])
  
  const [recipientName, setRecipientName] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [pickupAddress, setPickupAddress] = useState("")
  const [pickupNotes, setPickupNotes] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [packageDescription, setPackageDescription] = useState("")
  const [fee, setFee] = useState(5000)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchDrivers()
      setError(null)
    }
  }, [open])

  const fetchDrivers = async () => {
    try {
      const res = await fetch("/api/orders/drivers")
      if (res.ok) {
        const data = await res.json()
        setDrivers(data.drivers || [])
      }
    } catch {
      // ignore
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!recipientName || !recipientPhone || !pickupAddress || !deliveryAddress) {
      setError("Por favor completa los campos obligatorios")
      return
    }

    if (fee <= 0) {
      setError("La tarifa debe ser mayor a $0")
      return
    }

    if (assignmentType === "DIRECT" && !driverId) {
      setError("Por favor selecciona un domiciliario para la asignación directa")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          recipientPhone,
          pickupAddress,
          pickupNotes,
          deliveryAddress,
          deliveryNotes,
          packageDescription,
          totalFee: fee,
          assignmentType,
          driverId: assignmentType === "DIRECT" ? driverId : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al crear el pedido")
      }

      // Reset form
      setRecipientName("")
      setRecipientPhone("")
      setPickupAddress("")
      setPickupNotes("")
      setDeliveryAddress("")
      setDeliveryNotes("")
      setPackageDescription("")
      setFee(5000)
      setDriverId("")

      onOpenChange(false)
      if (onOrderCreated) onOrderCreated()
    } catch (err: any) {
      setError(err.message || "Error al procesar la creación del pedido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Pedido</DialogTitle>
          <DialogDescription>Completa los datos para solicitar un nuevo servicio de domicilio.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destinatario</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Nombre Completo *</Label>
                <Input
                  id="recipientName"
                  placeholder="Ej. María García"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Teléfono *</Label>
                <Input
                  id="recipientPhone"
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recogida</h4>
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Dirección de Recogida *</Label>
              <Input
                id="pickupAddress"
                placeholder="Calle 12 #45-67 (Tu restaurante)"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupNotes">Notas de Recogida</Label>
              <Textarea
                id="pickupNotes"
                placeholder="Instrucciones para empacar o entregar..."
                value={pickupNotes}
                onChange={(e) => setPickupNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entrega</h4>
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Dirección de Entrega *</Label>
              <Input
                id="deliveryAddress"
                placeholder="Av. Principal #89-12, Apto 302"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryNotes">Notas de Entrega</Label>
              <Textarea
                id="deliveryNotes"
                placeholder="Entregar en portería, timbrar en el 302..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paquete y Tarifa</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packageDescription">Descripción del Paquete</Label>
                <Input
                  id="packageDescription"
                  placeholder="Ej. 2 Hamburguesas + Bebidas"
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Tarifa ($ COP) *</Label>
                <NumberInput
                  id="fee"
                  value={fee}
                  onValueChange={(val) => setFee(val)}
                  min={500}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asignación</h4>
            <RadioGroup
              value={assignmentType}
              onValueChange={(v) => setAssignmentType(v as "DIRECT" | "BROADCAST")}
              className="grid grid-cols-2 gap-3"
            >
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                <RadioGroupItem value="DIRECT" id="direct" />
                <div>
                  <div className="text-sm font-medium">Directa</div>
                  <div className="text-[11px] text-muted-foreground">A un domiciliario específico</div>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                <RadioGroupItem value="BROADCAST" id="broadcast" />
                <div>
                  <div className="text-sm font-medium">Broadcast</div>
                  <div className="text-[11px] text-muted-foreground">Oferta a todo el grupo activo</div>
                </div>
              </label>
            </RadioGroup>

            {assignmentType === "DIRECT" && (
              <div className="space-y-2">
                <Label>Domiciliario *</Label>
                <Select value={driverId} onValueChange={(v) => setDriverId(v || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar domiciliario activo" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No hay domiciliarios activos en este momento
                      </SelectItem>
                    ) : (
                      drivers.map((drv) => (
                        <SelectItem key={drv.id} value={drv.id}>
                          {drv.fullName} — {drv.vehicleType}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Pedido (-1 Crédito)"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
