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
import {
  Shield,
  CreditCard,
  Bell,
  Trash2,
  Save,
  Loader2,
} from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { useUser } from "@/hooks/use-user"
import { NumberInput } from "@/components/ui/number-input"
import { TeamSection } from "@/components/settings/team-section"
import { BranchesSection } from "@/components/commerce/branches-section"
import { signOut } from "@/lib/auth-client"

interface SettingsData {
  email: string
  emailVerified: boolean
  createdAt: string
  commerce: {
    name: string
    slug: string
    isActive: boolean
    credits: number
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cambiar la contraseña")
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar la cuenta")
      setIsDeleting(false)
    }
  }

  if (userLoading) {
    return (
      <DashboardLayout>
        <Loading fullpage />
      </DashboardLayout>
    )
  }

  if (isAdmin) {
    router.replace("/admin/settings")
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tu cuenta, notificaciones y equipo
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-success/10 p-3 text-sm text-success">{success}</div>
        )}

        {isLoading ? (
          <Loading text="Cargando configuración..." className="py-16" />
        ) : (
          <>
            {/* Sucursales - full width */}
            <BranchesSection />

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Notificaciones */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4 w-4 text-primary" />
                    Notificaciones
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configura cómo recibir notificaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</h4>
                    {[
                      { key: "emailNewOrder" as const, label: "Nuevo pedido" },
                      { key: "emailOrderAssigned" as const, label: "Pedido asignado" },
                      { key: "emailLowCredits" as const, label: "Créditos bajos" },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between">
                        <Label htmlFor={item.key} className="text-sm">{item.label}</Label>
                        <Switch
                          id={item.key}
                          checked={notifications[item.key]}
                          onCheckedChange={checked => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp</h4>
                    {[
                      { key: "whatsappNewOrder" as const, label: "Nuevo pedido" },
                      { key: "whatsappOrderAssigned" as const, label: "Pedido asignado" },
                      { key: "whatsappLowCredits" as const, label: "Créditos bajos" },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between">
                        <Label htmlFor={item.key} className="text-sm">{item.label}</Label>
                        <Switch
                          id={item.key}
                          checked={notifications[item.key]}
                          onCheckedChange={checked => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSaveNotifications} disabled={isSaving} className="w-full">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar notificaciones
                  </Button>
                </CardContent>
              </Card>

              {/* Seguridad */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4 text-primary" />
                    Seguridad
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Cambia tu contraseña
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm">Contraseña actual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm">Nueva contraseña</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm">Confirmar contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isChangingPassword} className="w-full">
                      {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                      Actualizar contraseña
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Equipo */}
            <TeamSection />

            {/* Zona de peligro */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Zona de peligro
                </CardTitle>
                <CardDescription className="text-xs">
                  Eliminar tu cuenta es irreversible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Escribe <span className="font-mono font-medium">{settings?.email}</span> para confirmar
                </p>
                <Input
                  id="deleteEmail"
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount} 
                  disabled={isDeleting || deleteEmail !== settings?.email}
                >
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Eliminar mi cuenta
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
