"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhoneInput } from "@/components/ui/phone-input"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Store, Plus, MoreHorizontal, Pencil, Trash2,
  Star, Loader2, Clock
} from "lucide-react"
import { Loading } from "@/components/ui/loading"

interface Branch {
  id: string
  name: string
  address: string
  phone: string | null
  city: string | null
  lat: number | null
  lng: number | null
  orderPrefix: string
  workingHours: Record<string, { open: string; close: string; active: boolean }>
  isActive: boolean
  isDefault: boolean
}

interface BranchFormData {
  name: string
  address: string
  phone: string
  city: string
  lat: string
  lng: string
  orderPrefix: string
  workingHours: Record<string, { open: string; close: string; active: boolean }>
  isDefault: boolean
}

const colombianCities = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga",
  "Cartagena", "Cúcuta", "Ibagué", "Pereira", "Santa Marta",
  "Villavicencio", "Manizales", "Neiva", "Pasto", "Armenia",
  "Popayán", "Montería", "Sincelejo", "Valledupar", "Tulúa",
  "Girardot", "Flandes", "Ricaurte", "Tocaima", "Agua de Dios",
  "Melgar", "Espinal", "Coello", "Soacha",
  "Cajicá", "Chía", "Cota", "Sopo", "Tabio",
  "Tenjo", "Gachancipá", "Tocancipá", "Zipaquirá", "Cucunubá",
  "Lenguazaque", "Suesca", "Cogua", "Nemocón", "Pacho",
  "Villeta", "Nimaima", "Nocaima", "Quebradanegra", "Pulí",
  "San Antonio del Tequendama", "San Juan de Rioseco", "La Vega",
  "Facatativá", "Subachoque", "El Colegio", "Bojacá", "Mosquera",
  "Funza", "Madrid", "Fontibón", "Kennedy",
  "Fusagasugá", "Arbeláez", "San Bernardo", "Silvania", "Granada",
  "Chocontá", "Machetá", "Manta", "Sesquilé", "Guasca",
  "Gachalá", "Ubalá", "Gachetá",
  "Ubaté", "Fúquene", "Tausa", "Sutatausa", "Carmen de Carupa",
  "Anapoima", "Apaneca", "Apulo", "La Mesa", "Tena",
  "Viotá", "Cachipay",
]

const daysOfWeek = [
  { key: "monday", label: "Lun" },
  { key: "tuesday", label: "Mar" },
  { key: "wednesday", label: "Mié" },
  { key: "thursday", label: "Jue" },
  { key: "friday", label: "Vie" },
  { key: "saturday", label: "Sáb" },
  { key: "sunday", label: "Dom" },
]

const defaultWorkingHours: Record<string, { open: string; close: string; active: boolean }> = {
  monday: { open: "08:00", close: "20:00", active: true },
  tuesday: { open: "08:00", close: "20:00", active: true },
  wednesday: { open: "08:00", close: "20:00", active: true },
  thursday: { open: "08:00", close: "20:00", active: true },
  friday: { open: "08:00", close: "20:00", active: true },
  saturday: { open: "09:00", close: "18:00", active: true },
  sunday: { open: "09:00", close: "14:00", active: false },
}

const initialFormData: BranchFormData = {
  name: "",
  address: "",
  phone: "",
  city: "",
  lat: "",
  lng: "",
  orderPrefix: "ORD",
  workingHours: { ...defaultWorkingHours },
  isDefault: false,
}

export function BranchesSection() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState<BranchFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHours, setShowHours] = useState(false)

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/commerce/branches")
      if (res.ok) {
        const data = await res.json()
        setBranches(data.branches || [])
      }
    } catch (err) {
      console.error("Error fetching branches:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch)
      setFormData({
        name: branch.name,
        address: branch.address,
        phone: branch.phone || "",
        city: branch.city || "",
        lat: branch.lat?.toString() || "",
        lng: branch.lng?.toString() || "",
        orderPrefix: branch.orderPrefix,
        workingHours: branch.workingHours || { ...defaultWorkingHours },
        isDefault: branch.isDefault,
      })
    } else {
      setEditingBranch(null)
      setFormData(initialFormData)
    }
    setError(null)
    setShowHours(false)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.address) {
      setError("Nombre y dirección son obligatorios")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const url = "/api/commerce/branches"
      const method = editingBranch ? "PUT" : "POST"
      const body = editingBranch
        ? { ...formData, id: editingBranch.id }
        : formData

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al guardar")
      }

      setIsDialogOpen(false)
      fetchBranches()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (branchId: string) => {
    if (!confirm("¿Eliminar esta sucursal?")) return

    try {
      const res = await fetch(`/api/commerce/branches?id=${branchId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Error al eliminar")
        return
      }

      fetchBranches()
    } catch (err) {
      console.error("Error deleting branch:", err)
    }
  }

  const handleToggleDefault = async (branch: Branch) => {
    try {
      const res = await fetch("/api/commerce/branches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: branch.id, isDefault: true }),
      })

      if (res.ok) {
        fetchBranches()
      }
    } catch (err) {
      console.error("Error setting default branch:", err)
    }
  }

  const toggleWorkingDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          active: !prev.workingHours[day]?.active,
        },
      },
    }))
  }

  const updateWorkingHour = (day: string, field: "open" | "close", value: string) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }))
  }

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-8">
          <Loading text="Cargando sucursales..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="h-4 w-4 text-primary" />
              Sucursales
            </CardTitle>
            <CardDescription className="text-xs">
              Administra las ubicaciones, horarios y prefijos de tu negocio
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {branches.length === 0 ? (
          <div className="text-center py-6">
            <Store className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No tienes sucursales configuradas
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Agrega una sucursal para empezar a crear pedidos
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Prefijo</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => {
                const activeDays = Object.values(branch.workingHours || {}).filter(d => d.active).length
                return (
                  <TableRow key={branch.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{branch.name}</span>
                        {branch.isDefault && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            <Star className="mr-1 h-3 w-3" />
                            Default
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                      {branch.address}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {branch.city || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {branch.orderPrefix}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activeDays}/7 días
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(branch)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {!branch.isDefault && (
                            <DropdownMenuItem onClick={() => handleToggleDefault(branch)}>
                              <Star className="mr-2 h-4 w-4" />
                              Marcar como default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(branch.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}
              </DialogTitle>
              <DialogDescription>
                {editingBranch
                  ? "Actualiza los datos de la sucursal"
                  : "Agrega una nueva ubicación de tu negocio"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="branchName">Nombre *</Label>
                <Input
                  id="branchName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Sede Principal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchAddress">Dirección *</Label>
                <Input
                  id="branchAddress"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Calle 12 #45-67"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branchPhone">Teléfono</Label>
                  <PhoneInput
                    id="branchPhone"
                    value={formData.phone}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchCity">Ciudad</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, city: value || "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {formData.city || "Seleccionar ciudad"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {colombianCities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branchLat">Latitud</Label>
                  <Input
                    id="branchLat"
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                    placeholder="4.7110"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchLng">Longitud</Label>
                  <Input
                    id="branchLng"
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                    placeholder="-74.0721"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-2">
                  <Label htmlFor="branchPrefix">Prefijo de Pedidos</Label>
                  <Input
                    id="branchPrefix"
                    value={formData.orderPrefix}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderPrefix: e.target.value.toUpperCase() }))}
                    placeholder="ORD"
                    className="font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Ejemplo: <span className="font-mono">{formData.orderPrefix || "ORD"}-0001</span>
                  </p>
                </div>
                <div className="space-y-2"></div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Horario de Atención</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHours(!showHours)}
                    className="h-7 text-xs"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    {showHours ? "Ocultar" : "Configurar"}
                  </Button>
                </div>
                {showHours && (
                  <div className="space-y-2 rounded-md border p-3">
                    {daysOfWeek.map(day => {
                      const dayHours = formData.workingHours[day.key]
                      return (
                        <div key={day.key} className="flex items-center gap-2">
                          <Switch
                            checked={dayHours?.active ?? false}
                            onCheckedChange={() => toggleWorkingDay(day.key)}
                            className="scale-75"
                          />
                          <span className="text-xs w-8">{day.label}</span>
                          {dayHours?.active ? (
                            <>
                              <Input
                                type="time"
                                value={dayHours.open}
                                onChange={(e) => updateWorkingHour(day.key, "open", e.target.value)}
                                className="h-7 w-24 text-xs"
                              />
                              <span className="text-xs text-muted-foreground">a</span>
                              <Input
                                type="time"
                                value={dayHours.close}
                                onChange={(e) => updateWorkingHour(day.key, "close", e.target.value)}
                                className="h-7 w-24 text-xs"
                              />
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">Cerrado</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="branchDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="branchDefault" className="text-sm">
                  Sucursal por defecto
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBranch ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
