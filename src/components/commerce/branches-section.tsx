"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
  MapPin, Star, Loader2 
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
  isDefault: boolean
}

const initialFormData: BranchFormData = {
  name: "",
  address: "",
  phone: "",
  city: "",
  lat: "",
  lng: "",
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
        isDefault: branch.isDefault,
      })
    } else {
      setEditingBranch(null)
      setFormData(initialFormData)
    }
    setError(null)
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
              Administra las ubicaciones de tu negocio
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
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
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
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {branch.address}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {branch.city || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={branch.isActive ? "default" : "secondary"}>
                      {branch.isActive ? "Activa" : "Inactiva"}
                    </Badge>
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
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
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
                  <Input
                    id="branchPhone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="300 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchCity">Ciudad</Label>
                  <Input
                    id="branchCity"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Bogotá"
                  />
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
