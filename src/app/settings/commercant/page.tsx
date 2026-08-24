"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  Building2,
  CreditCard,
  Bell,
  Clock,
  MapPin,
  Download,
  Trash2,
  AlertTriangle,
  Save,
} from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { PasswordStrength } from "@/components/ui/password-strength"
import { PasswordInput } from "@/components/ui/password-input"
import { signOut } from "@/lib/auth-client"
import { useUser } from "@/hooks/use-user"
import { parseNumericInput, cn } from "@/lib/utils"
import { NumberInput } from "@/components/ui/number-input"
import { TeamSection } from "@/components/settings/team-section"
import { BranchesSection } from "@/components/commerce/branches-section"


interface SettingsData {
  email: string
  createdAt: string
  commerce: {
    name: string
    slug: string
    isActive: boolean
    credits: number
    address: string | null
    phone: string | null
    whatsapp: string | null
  } | null
  stats: {
    orders: number
    transactions: number
  }
}

interface NotificationSettings {
  emailNewOrder: boolean
  emailOrderAssigned: boolean
  emailLowCredits: boolean
  whatsappNewOrder: boolean
  whatsappOrderAssigned: boolean
  whatsappLowCredits: boolean
}

interface BusinessSettings {
  orderPrefix: string
  workingHours: Record<string, { open: string; close: string; active: boolean }>
  city: string
  lat: number | null
  lng: number | null
}

const daysOfWeek = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
]

const colombianCities = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga",
  "Cartagena", "Cúcuta", "Ibagué", "Pereira", "Santa Marta",
  "Villavicencio", "Manizales", "Neiva", "Pasto", "Armenia",
  "Popayán", "Montería", "Sincelejo", "Valledupar", "Tulúa",
]

export default function CommercantSettingsPage() {
  const { isAdmin, isLoading: userLoading } = useUser()
  const router = useRouter()
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNewOrder: true,
    emailOrderAssigned: true,
    emailLowCredits: true,
    whatsappNewOrder: false,
    whatsappOrderAssigned: false,
    whatsappLowCredits: true,
  })
  const [business, setBusiness] = useState<BusinessSettings>({
    orderPrefix: "ORD",
    workingHours: {},
    city: "",
    lat: null,
    lng: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [deleteEmail, setDeleteEmail] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!userLoading && isAdmin) {
      router.replace("/admin/settings")
      return
    }
    fetchAllSettings()
  }, [userLoading, isAdmin, router])

  const fetchAllSettings = async () => {
    try {
      const [settingsRes, notificationsRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/settings/notifications"),
      ])
      const [settingsData, notificationsData] = await Promise.all([
        settingsRes.json(),
        notificationsRes.json(),
      ])
      setSettings(settingsData)
      setNotifications(notificationsData)
      if (settingsData?.commerce) {
        setBusiness(prev => ({
          ...prev,
          city: settingsData.commerce.city || "",
          lat: settingsData.commerce.lat ? parseFloat(settingsData.commerce.lat) : null,
          lng: settingsData.commerce.lng ? parseFloat(settingsData.commerce.lng) : null,
        }))
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      })
      if (!response.ok) throw new Error("Error al guardar")
      setSuccess("Notificaciones guardadas")
    } catch {
      setError("Error al guardar notificaciones")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveBusiness = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commerceName: settings?.commerce?.name,
          commercePhone: settings?.commerce?.phone,
          commerceAddress: settings?.commerce?.address,
          commerceWhatsapp: settings?.commerce?.whatsapp,
          commerceCity: business.city,
          commerceLat: business.lat,
          commerceLng: business.lng,
        }),
      })
      if (!response.ok) throw new Error("Error al guardar")
      setSuccess("Configuración del negocio guardada")
    } catch {
      setError("Error al guardar configuración del negocio")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (passwordData.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }
    setIsChangingPassword(true)
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      setSuccess("Contraseña actualizada correctamente")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err: any) {
      setError(err.message || "Error al cambiar la contraseña")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteEmail !== settings?.email) {
      setError("El email no coincide")
      return
    }
    setIsDeleting(true)
    try {
      const response = await fetch("/api/settings/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: deleteEmail }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      await signOut()
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Error al eliminar la cuenta")
      setIsDeleting(false)
    }
  }

  const handleExportOrders = () => {
    const csv = "Pedido,Fecha,Estado,Total\nEjemplo,2024-01-01,Entregado,$15.000"
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pedidos-export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportTransactions = () => {
    const csv = "Transacción,Fecha,Tipo,Créditos\nEjemplo,2024-01-01,Compra,100"
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transacciones-export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleWorkingDay = (day: string) => {
    setBusiness(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: { ...prev.workingHours[day], active: !prev.workingHours[day]?.active },
      },
    }))
  }

  const updateWorkingHours = (day: string, field: "open" | "close", value: string) => {
    setBusiness(prev => ({
      ...prev,
      workingHours: { ...prev.workingHours, [day]: { ...prev.workingHours[day], [field]: value } },
    }))
  }

  if (isLoading || userLoading) {
    return (
      <DashboardLayout>
        <Loading fullpage />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tu negocio y preferencias
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-success/10 p-3 text-sm text-success">{success}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>Cambia tu contraseña</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                  <PasswordInput
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <PasswordInput
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <PasswordInput
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <PasswordStrength
                  password={passwordData.newPassword}
                  confirmPassword={passwordData.confirmPassword}
                />

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? <Loading text="Cambiando..." className="flex-row gap-2" /> : null}
                  Cambiar contraseña
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>Configura cómo recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Email</h4>
                <div className="space-y-3">
                  {[
                    { key: "emailNewOrder" as const, label: "Nuevo pedido" },
                    { key: "emailOrderAssigned" as const, label: "Pedido asignado" },
                    { key: "emailLowCredits" as const, label: "Créditos bajos" },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <Switch
                        id={item.key}
                        checked={notifications[item.key]}
                        onCheckedChange={checked => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">WhatsApp</h4>
                <div className="space-y-3">
                  {[
                    { key: "whatsappNewOrder" as const, label: "Nuevo pedido" },
                    { key: "whatsappOrderAssigned" as const, label: "Pedido asignado" },
                    { key: "whatsappLowCredits" as const, label: "Créditos bajos" },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <Switch
                        id={item.key}
                        checked={notifications[item.key]}
                        onCheckedChange={checked => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleSaveNotifications} disabled={isSaving}>
                {isSaving ? <Loading text="Guardando..." className="flex-row gap-2" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar notificaciones
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Negocio
            </CardTitle>
            <CardDescription>Configuración de tu negocio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orderPrefix" className="text-sm font-medium">
                  Prefijo de órdenes
                </Label>
                <Input
                  id="orderPrefix"
                  value={business.orderPrefix || "ORD"}
                  onChange={(e) =>
                    setBusiness(prev => ({ ...prev, orderPrefix: e.target.value || "ORD" }))
                  }
                  placeholder="ORD"
                  className="max-w-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Ejemplo: <span className="font-mono text-foreground">{business.orderPrefix || "ORD"}-001</span>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  Ciudad *
                </Label>
                <Select
                  value={business.city}
                  onValueChange={(value) => setBusiness(prev => ({ ...prev, city: value || "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {colombianCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Ciudad donde opera tu negocio
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-4">Ubicación del negocio</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Coordenadas geográficas de tu dirección. Se usarán para calcular distancias y tarifas.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lat" className="text-sm font-medium">
                    Latitud
                  </Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={business.lat ?? ""}
                    onChange={(e) =>
                      setBusiness(prev => ({ ...prev, lat: e.target.value ? parseFloat(e.target.value) : null }))
                    }
                    placeholder="4.7110"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng" className="text-sm font-medium">
                    Longitud
                  </Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={business.lng ?? ""}
                    onChange={(e) =>
                      setBusiness(prev => ({ ...prev, lng: e.target.value ? parseFloat(e.target.value) : null }))
                    }
                    placeholder="-74.0721"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Ejemplo Bogotá: 4.7110, -74.0721
              </p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Horario de atención</h4>
                </div>
                <span className="text-xs text-muted-foreground">
                  {daysOfWeek.filter(d => business.workingHours[d.key]?.active).length} días abiertos
                </span>
              </div>
              <div className="space-y-2">
                {daysOfWeek.map(day => {
                  const isActive = business.workingHours[day.key]?.active ?? false
                  return (
                    <div
                      key={day.key}
                      className={cn(
                        "flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors sm:flex-nowrap",
                        isActive ? "border-border/60 bg-background" : "border-border/40 bg-muted/20"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => toggleWorkingDay(day.key)}
                        />
                        <span className={cn("text-sm shrink-0", !isActive && "text-muted-foreground")}>
                          {day.label}
                        </span>
                      </div>
                      {isActive ? (
                        <div className="flex items-center gap-1.5 sm:ml-auto">
                          <Input
                            type="time"
                            value={business.workingHours[day.key]?.open || "08:00"}
                            onChange={e => updateWorkingHours(day.key, "open", e.target.value)}
                            className="w-24 h-8 text-xs px-2"
                          />
                          <span className="text-xs text-muted-foreground">a</span>
                          <Input
                            type="time"
                            value={business.workingHours[day.key]?.close || "20:00"}
                            onChange={e => updateWorkingHours(day.key, "close", e.target.value)}
                            className="w-24 h-8 text-xs px-2"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic sm:ml-auto">Cerrado</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveBusiness} disabled={isSaving}>
                {isSaving ? <Loading text="Guardando..." className="flex-row gap-2" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar configuración
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Datos y exportación
              </CardTitle>
              <CardDescription>Exporta tu historial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Pedidos</p>
                  <p className="text-xs text-muted-foreground">{settings?.stats.orders || 0} totales</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportOrders}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Transacciones</p>
                  <p className="text-xs text-muted-foreground">{settings?.stats.transactions || 0} totales</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportTransactions}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Zona de peligro
              </CardTitle>
              <CardDescription>Acciones irreversibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Eliminar tu cuenta borra permanentemente todos tus datos. Esta acción no se puede deshacer.
              </p>
              <div className="space-y-2">
                <Label htmlFor="deleteEmail">
                  Escribe <span className="font-mono font-medium">{settings?.email}</span> para confirmar
                </Label>
                <Input id="deleteEmail" type="email" value={deleteEmail} onChange={e => setDeleteEmail(e.target.value)} placeholder="tu@email.com" />
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting || deleteEmail !== settings?.email}>
                {isDeleting ? <Loading text="Eliminando..." className="flex-row gap-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Eliminar mi cuenta
              </Button>
            </CardContent>
          </Card>
        </div>

        <TeamSection />

        <BranchesSection />
      </div>
    </DashboardLayout>
  )
}
