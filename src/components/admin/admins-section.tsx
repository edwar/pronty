"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShieldAlert, Plus, ShieldCheck, Phone, Calendar, Loader2, UserCheck } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"


interface AdminUser {
  id: string
  name: string | null
  email: string
  phone: string | null
  createdAt: string
}

export function AdminsSection() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/settings/admins")
      if (!response.ok) throw new Error("Error al obtener los administradores")
      const data = await response.json()
      setAdmins(data.admins || [])
    } catch (err: any) {
      setError(err.message || "Error al cargar la lista de administradores")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
    })
    setFormError(null)
    setDialogOpen(true)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setFormError("Los campos Nombre, Email y Contraseña son obligatorios.")
      return
    }

    if (formData.password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/admin/settings/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Error al registrar el administrador")
      }

      setDialogOpen(false)
      fetchAdmins()
    } catch (err: any) {
      setFormError(err.message || "Ocurrió un error al procesar el registro.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card className="border-border/60 col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Gestión de Administradores
            </CardTitle>
            <CardDescription>
              Administradores con acceso y control global sobre la plataforma.
            </CardDescription>
          </div>
          <Button size="sm" onClick={handleOpenDialog} className="h-8">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Agregar Admin
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando administradores...
            </div>
          ) : admins.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No hay administradores registrados"
              description="Agrega administradores para que gestionen la plataforma junto a ti."
              compact
            />
          ) : (
            <div className="rounded-md border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        {admin.name || "Sin nombre"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {admin.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            {admin.phone}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {new Date(admin.createdAt).toLocaleDateString("es-CO", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Agregar Administrador
            </DialogTitle>
            <DialogDescription>
              Registra un nuevo administrador con acceso total al panel Master.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAdmin} className="space-y-4 py-2">
            {formError && (
              <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                placeholder="Ej. Carlos Giraldo"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@pronty.co"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (Celular)</Label>
              <PhoneInput
                id="phone"
                value={formData.phone}
                onValueChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
