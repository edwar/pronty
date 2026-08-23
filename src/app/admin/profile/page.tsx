"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Save, User, Shield, Store, Users, Package } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { Loading } from "@/components/ui/loading"

interface ProfileData {
  user: {
    id: string
    email: string
    name: string | null
    phone: string | null
    avatarUrl: string | null
    role: string
  }
}

interface PlatformStats {
  users: number
  commerces: number
  orders: number
}

export default function AdminProfilePage() {
  const { isAdmin, isLoading: userLoading } = useUser()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  })

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/dashboard")
      return
    }
    fetchProfile()
    fetchStats()
  }, [userLoading, isAdmin, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      const data = await response.json()
      if (!response.ok || !data.user) return
      setProfile(data)
      setFormData({
        name: data.user.name || "",
        phone: data.user.phone || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [usersRes, commercesRes, ordersRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/commerces"),
        fetch("/api/admin/orders"),
      ])
      const [usersData, commercesData, ordersData] = await Promise.all([
        usersRes.json(),
        commercesRes.json(),
        ordersRes.json(),
      ])
      setStats({
        users: usersData.users?.length ?? 0,
        commerces: commercesData.commerces?.length ?? 0,
        orders: ordersData.orders?.length ?? 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, phone: formData.phone }),
      })
      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Error al guardar")
        return
      }
      setSuccess(true)
      fetchProfile()
    } catch {
      setError("Error al conectar con el servidor")
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
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
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Información de tu cuenta de administrador
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-success/10 p-3 text-sm text-success">
            Perfil actualizado correctamente
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>Datos de tu cuenta de usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.user.avatarUrl || ""} alt={profile?.user.name || ""} />
                  <AvatarFallback className="text-lg">{getInitials(profile?.user.name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-medium">{profile?.user.email}</p>
                  <Badge className="bg-primary/10 text-primary">
                    <Shield className="mr-1 h-3 w-3" />
                    Administrador
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" value={formData.name} onChange={handleChange} placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+57 300 123 4567" />
                </div>
              </div>
            </CardContent>
          </Card>

          {stats && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Resumen de la plataforma
                </CardTitle>
                <CardDescription>Estadísticas generales del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{stats.users}</p>
                      <p className="text-xs text-muted-foreground">Usuarios</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                      <Store className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{stats.commerces}</p>
                      <p className="text-xs text-muted-foreground">Comercios</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                      <Package className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{stats.orders}</p>
                      <p className="text-xs text-muted-foreground">Pedidos</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => router.push("/admin/users")}>
                    Gestionar usuarios
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loading text="Guardando..." className="flex-row gap-2" /> : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
