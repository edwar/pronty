"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Store,
  MoreHorizontal,
  UserCheck,
  UserX,
  CreditCard,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"

interface AdminCommerce {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  phone: string | null
  whatsapp: string | null
  isActive: boolean
  credits: number
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
  }
  _count: {
    orders: number
    transactions: number
  }
}

const filters = [
  { value: "ALL", label: "Todos" },
  { value: "ACTIVE", label: "Activos" },
  { value: "INACTIVE", label: "Inactivos" },
]

export default function AdminCommercesPage() {
  const { isAdmin, isLoading: userLoading } = useUser()
  const router = useRouter()
  const [commerces, setCommerces] = useState<AdminCommerce[]>([])
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
    fetchCommerces()
  }, [])

  const fetchCommerces = async () => {
    try {
      const response = await fetch("/api/admin/commerces")
      const data = await response.json()
      setCommerces(data.commerces || [])
    } catch (err) {
      console.error("Error fetching commerces:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (commerceId: string, isActive: boolean) => {
    setActionLoading(commerceId)
    setError(null)
    try {
      const response = await fetch(`/api/admin/commerces/${commerceId}/toggle-active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al cambiar el estado")
        return
      }

      fetchCommerces()
    } catch (err) {
      setError("Error al conectar con el servidor")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredCommerces = useMemo(() => {
    return commerces.filter((c) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" && c.isActive) ||
        (filter === "INACTIVE" && !c.isActive)
      const term = search.toLowerCase()
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.user.email.toLowerCase().includes(term) ||
        (c.user.name?.toLowerCase().includes(term) ?? false)
      return matchesFilter && matchesSearch
    })
  }, [commerces, filter, search])

  const stats = useMemo(() => {
    const active = commerces.filter((c) => c.isActive).length
    const totalCredits = commerces.reduce((sum, c) => sum + c.credits, 0)
    const totalOrders = commerces.reduce((sum, c) => sum + c._count.orders, 0)
    return { active, inactive: commerces.length - active, totalCredits, totalOrders }
  }, [commerces])

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
            <h1 className="text-3xl font-bold tracking-tight">Comercios</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestiona los negocios registrados en la plataforma
            </p>
          </div>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar comercio..."
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

        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{commerces.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Comercios</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stats.active}</p>
                <p className="mt-1 text-xs text-muted-foreground">Activos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stats.inactive}</p>
                <p className="mt-1 text-xs text-muted-foreground">Inactivos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                <CreditCard className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stats.totalCredits}</p>
                <p className="mt-1 text-xs text-muted-foreground">Créditos totales</p>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  filter === f.value ? "bg-primary-foreground/20" : "bg-muted"
                )}
              >
                {f.value === "ALL"
                  ? commerces.length
                  : f.value === "ACTIVE"
                    ? stats.active
                    : stats.inactive}
              </span>
            </Button>
          ))}
        </div>

        <Card className="border-border/60">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loading text="Cargando comercios..." />
              </div>
            ) : filteredCommerces.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Store className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium">No se encontraron comercios</p>
                <p className="text-xs text-muted-foreground">
                  {search ? "Intenta con otra búsqueda" : "No hay comercios con este filtro"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Comercio</TableHead>
                    <TableHead>Propietario</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Créditos</TableHead>
                    <TableHead>Pedidos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="pr-6 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommerces.map((commerce) => (
                    <TableRow key={commerce.id} className="border-b border-border/40">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                            {commerce.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{commerce.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              /{commerce.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate text-sm">{commerce.user.name ?? "Sin nombre"}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {commerce.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {commerce.phone && (
                            <p className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3" />
                              {commerce.phone}
                            </p>
                          )}
                          {commerce.address && (
                            <p className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3" />
                              <span className="max-w-40 truncate">{commerce.address}</span>
                            </p>
                          )}
                          {!commerce.phone && !commerce.address && <span>—</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-semibold">{commerce.credits}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{commerce._count.orders}</span>
                      </TableCell>
                      <TableCell>
                        {commerce.isActive ? (
                          <Badge className="gap-1 bg-success/10 text-success">
                            <CheckCircle2 className="h-3 w-3" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={actionLoading === commerce.id}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                          >
                            {actionLoading === commerce.id ? (
                              <Loading text="" className="flex-row gap-2" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(commerce.id, commerce.isActive)}
                            >
                              {commerce.isActive ? (
                                <>
                                  <UserX className="h-4 w-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled>
                              <CreditCard className="h-4 w-4" />
                              Ajustar créditos
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
