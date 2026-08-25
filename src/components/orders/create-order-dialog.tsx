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
import { PhoneInput } from "@/components/ui/phone-input"
import { Loader2, AlertCircle, MapPin, Calculator, Store } from "lucide-react"
import { haversineDistance, calculateDeliveryFee, formatDistance } from "@/lib/distance"

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

interface Branch {
  id: string
  name: string
  address: string
  phone: string | null
  city: string | null
  lat: number | null
  lng: number | null
  isDefault: boolean
}

interface DeliveryPricing {
  baseFee: number
  pricePerKm: number
}

export function CreateOrderDialog({ open, onOpenChange, onOrderCreated }: CreateOrderDialogProps) {
  const [assignmentType, setAssignmentType] = useState<"DIRECT" | "BROADCAST">("DIRECT")
  const [driverId, setDriverId] = useState<string>("")
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")

  const [recipientName, setRecipientName] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [pickupAddress, setPickupAddress] = useState("")
  const [pickupNotes, setPickupNotes] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [packageDescription, setPackageDescription] = useState("")
  const [fee, setFee] = useState(5000)

  const [pricing, setPricing] = useState<DeliveryPricing>({ baseFee: 5000, pricePerKm: 1500 })
  const [distance, setDistance] = useState<number | null>(null)
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null)
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchDrivers()
      fetchBranches()
      fetchPricing()
      setError(null)
      setSelectedBranchId("")
      setPickupAddress("")
      setPickupNotes("")
      setDistance(null)
      setDeliveryLat(null)
      setDeliveryLng(null)
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

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/commerce/branches")
      if (res.ok) {
        const data = await res.json()
        const branchList = data.branches || []
        setBranches(branchList)

        // Select default branch
        const defaultBranch = branchList.find((b: Branch) => b.isDefault)
        if (defaultBranch) {
          setSelectedBranchId(defaultBranch.id)
          setPickupAddress(defaultBranch.address)
        } else if (branchList.length > 0) {
          setSelectedBranchId(branchList[0].id)
          setPickupAddress(branchList[0].address)
        }
      }
    } catch {
      // ignore
    }
  }

  const fetchPricing = async () => {
    try {
      const res = await fetch("/api/admin/settings")
      if (res.ok) {
        const data = await res.json()
        if (data.delivery) {
          setPricing({
            baseFee: data.delivery.baseFee || 5000,
            pricePerKm: data.delivery.pricePerKm || 1500,
          })
          setFee(data.delivery.baseFee || 5000)
        }
      }
    } catch {
      // ignore
    }
  }

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId)
    const branch = branches.find(b => b.id === branchId)
    if (branch) {
      setPickupAddress(branch.address)
      calculateDistanceAndFee(branch.lat, branch.lng, deliveryLat, deliveryLng)
    }
  }

  const calculateDistanceAndFee = (
    branchLat: number | null | undefined,
    branchLng: number | null | undefined,
    destLat: number | null,
    destLng: number | null
  ) => {
    if (!branchLat || !branchLng || !destLat || !destLng) {
      setDistance(null)
      return
    }

    const dist = haversineDistance(branchLat, branchLng, destLat, destLng)
    setDistance(dist)
    const newFee = calculateDeliveryFee(dist, pricing.baseFee, pricing.pricePerKm)
    setFee(newFee)
  }

  const handleDeliveryLocationChange = (lat: number, lng: number) => {
    setDeliveryLat(lat)
    setDeliveryLng(lng)
    const branch = branches.find(b => b.id === selectedBranchId)
    calculateDistanceAndFee(branch?.lat ?? null, branch?.lng ?? null, lat, lng)
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

    const selectedBranch = branches.find(b => b.id === selectedBranchId)

    setLoading(true)

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          recipientPhone,
          branchId: selectedBranchId || null,
          pickupAddress,
          pickupNotes,
          pickupLat: selectedBranch?.lat,
          pickupLng: selectedBranch?.lng,
          deliveryAddress,
          deliveryNotes,
          deliveryLat,
          deliveryLng,
          packageDescription,
          totalFee: fee,
          distanceKm: distance,
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
      setFee(pricing.baseFee)
      setDriverId("")
      setSelectedBranchId("")
      setDistance(null)
      setDeliveryLat(null)
      setDeliveryLng(null)

      onOpenChange(false)
      if (onOrderCreated) onOrderCreated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al procesar la creación del pedido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-10 pb-4 border-b shrink-0">
          <DialogTitle>Crear Nuevo Pedido</DialogTitle>
          <DialogDescription>Completa los datos para solicitar un nuevo servicio de domicilio.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="order-form" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sucursal de Origen</h4>
              {branches.length === 0 ? (
                <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    No hay sucursales configuradas. Agrega una en{" "}
                    <span className="font-medium text-foreground">Configuración → Sucursales</span>
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Sucursal *</Label>
                  <Select value={selectedBranchId} onValueChange={(v) => v && handleBranchChange(v)}>
                    <SelectTrigger>
                      <SelectValue>
                        {branches.find(b => b.id === selectedBranchId)
                          ? `${branches.find(b => b.id === selectedBranchId)!.name} — ${branches.find(b => b.id === selectedBranchId)!.address}`
                          : "Seleccionar sucursal"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} — {branch.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedBranchId && (
                <div className="space-y-2">
                  <Label htmlFor="pickupAddress">Dirección de Recogida *</Label>
                  <Input
                    id="pickupAddress"
                    placeholder="Dirección de la sucursal"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    required
                  />
                </div>
              )}
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
                  <PhoneInput
                    id="recipientPhone"
                    value={recipientPhone}
                    onValueChange={setRecipientPhone}
                    required
                  />
                </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryLat">Latitud destino</Label>
                  <Input
                    id="deliveryLat"
                    type="number"
                    step="any"
                    placeholder="4.7110"
                    value={deliveryLat ?? ""}
                    onChange={(e) => {
                      const lat = e.target.value ? parseFloat(e.target.value) : null
                      setDeliveryLat(lat)
                      if (lat && deliveryLng) {
                        handleDeliveryLocationChange(lat, deliveryLng)
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryLng">Longitud destino</Label>
                  <Input
                    id="deliveryLng"
                    type="number"
                    step="any"
                    placeholder="-74.0721"
                    value={deliveryLng ?? ""}
                    onChange={(e) => {
                      const lng = e.target.value ? parseFloat(e.target.value) : null
                      setDeliveryLng(lng)
                      if (deliveryLat && lng) {
                        handleDeliveryLocationChange(deliveryLat, lng)
                      }
                    }}
                  />
                </div>
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
              {distance !== null && (
                <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Distancia: <span className="font-medium text-foreground">{formatDistance(distance)}</span>
                    {" "}— Tarifa calculada: <span className="font-medium text-foreground">${fee.toLocaleString("es-CO")}</span>
                  </span>
                </div>
              )}
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

          </form>
        </div>

        <DialogFooter className="shrink-0 bg-background border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="order-form" disabled={loading}>
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
      </DialogContent>
    </Dialog>
  )
}
