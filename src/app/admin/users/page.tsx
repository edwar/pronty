"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Shield,
  Store,
  Bike,
  User as UserIcon,
  MoreHorizontal,
  Check,
} from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"

interface AdminUser {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  avatarUrl: string | null
  emailVerified: boolean
  createdAt: string
  commerce: { id: string; name: string; isActive: boolean } | null
  driver: { id: string; fullName: string; isApproved: boolean; isActive: boolean } | null
}

const roleConfig: Record<string, { label: string; icon: typeof Shield; badgeClass: string }> = {
  ADMIN_MASTER: {
    label: "Administrador",
    icon: Shield,
    badgeClass: "bg-primary/10 text-primary",
  },
  COMMERCER: {
    label: "Comerciante",
    icon: Store,
    badgeClass: "bg-success/10 text-success",
  },
  DRIVER: {
    label: "Domiciliario",
    icon: Bike,
    badgeClass: "bg-warning/10 text-warning",
  },
  PERSON: {
    label: "Persona",
    icon: UserIcon,
    badgeClass: "bg-muted text-muted-foreground",
  },
}

const filters = [
  { value: "ALL", label: "Todos" },
  { value: "ADMIN_MASTER", label: "Admins" },
  { value: "COMMERCER", label: "Comerciantes" },
  { value: "DRIVER", label: "Domiciliarios" },
  { value: "PERSON", label: "Personas" },
]

export default function AdminUsersPage() {
  const { isAdmin, isLoading: userLoading, user: currentUser } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, userLoading, router])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error("Error fetching users:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeRole = async (userId: string, role: string) => {
    setActionLoading(userId)
    setError(null)
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al cambiar el rol")
        return
      }

      fetchUsers()
    } catch (err) {
      setError("Error al conectar con el servidor")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesFilter = filter === "ALL" || u.role === filter
      const term = search.toLowerCase()
      const matchesSearch =
        !term ||
        u.email.toLowerCase().includes(term) ||
        (u.name?.toLowerCase().includes(term) ?? false) ||
        (u.commerce?.name.toLowerCase().includes(term) ?? false) ||
        (u.driver?.fullName.toLowerCase().includes(term) ?? false)
      return matchesFilter && matchesSearch
    })
  }, [users, filter, search])

  const counts = useMemo(() => {
    return {
      ALL: users.length,
      ADMIN_MASTER: users.filter((u) => u.role === "ADMIN_MASTER").length,
      COMMERCER: users.filter((u) => u.role === "COMMERCER").length,
      DRIVER: users.filter((u) => u.role === "DRIVER").length,
      PERSON: users.filter((u) => u.role === "PERSON").length,
    }
  }, [users])

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  if (userLoading || !isAdmin) {
    return (
      <DashboardLayout>
        <Loading fullpage />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestiona los usuarios y roles de la plataforma
            </p>
          </div>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar usuario..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                  filter === f.value
                    ? "bg-primary-foreground/20"
                    : "bg-muted"
                )}
              >
                {counts[f.value as keyof typeof counts]}
              </span>
            </Button>
          ))}
        </div>

        <Card className="border-border/60">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loading text="Cargando usuarios..." />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <UserIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium">No se encontraron usuarios</p>
                <p className="text-xs text-muted-foreground">
                  {search ? "Intenta con otra búsqueda" : "No hay usuarios con este filtro"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Negocio / Perfil</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead className="pr-6 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const role = roleConfig[user.role] ?? roleConfig.PERSON
                    const RoleIcon = role.icon
                    const isSelf = user.id === currentUser?.id

                    return (
                      <TableRow key={user.id} className="border-b border-border/40">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatarUrl ?? ""} alt={user.name ?? user.email} />
                              <AvatarFallback className="text-xs">
                                {getInitials(user.name, user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                                {user.name ?? "Sin nombre"}
                                {isSelf && (
                                  <span className="text-xs font-normal text-muted-foreground">
                                    (tú)
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1", role.badgeClass)}>
                            <RoleIcon className="h-3 w-3" />
                            {role.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {user.phone ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.commerce && (
                            <span className="text-sm">
                              {user.commerce.name}
                              {!user.commerce.isActive && (
                                <span className="ml-1.5 text-xs text-muted-foreground">
                                  (inactivo)
                                </span>
                              )}
                            </span>
                          )}
                          {user.driver && (
                            <span className="text-sm">
                              {user.driver.fullName}
                              {!user.driver.isApproved ? (
                                <span className="ml-1.5 text-xs text-warning">pendiente</span>
                              ) : !user.driver.isActive ? (
                                <span className="ml-1.5 text-xs text-muted-foreground">
                                  inactivo
                                </span>
                              ) : null}
                            </span>
                          )}
                          {!user.commerce && !user.driver && (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              disabled={isSelf || actionLoading === user.id}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                            >
                              {actionLoading === user.id ? (
                                <Loading text="" className="flex-row gap-2" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <p className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
                                Cambiar rol
                              </p>
                              <DropdownMenuSeparator />
                              {Object.entries(roleConfig).map(([value, config]) => (
                                <DropdownMenuItem
                                  key={value}
                                  disabled={user.role === value}
                                  onClick={() => handleChangeRole(user.id, value)}
                                >
                                  <config.icon className="h-4 w-4" />
                                  {config.label}
                                  {user.role === value && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
