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
import { Package, MessageCircle, Save, Info, Loader2, CreditCard, Lock, MapPin } from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { NumberInput } from "@/components/ui/number-input"
import { CreditsSection } from "@/components/admin/credits-section"
import { useUser } from "@/hooks/use-user"
import { AdminsSection } from "@/components/admin/admins-section"


interface CreditPackage {
  id: string
  name: string
  credits: number
  discount: number
  popular: boolean
  features: string[]
}

interface GlobalSettings {
  commissions: {
    driverRate: number
    platformFee: number
  }
  orders: {
    directAssignmentTimeout: number
    orderExpiryMinutes: number
  }
  delivery: {
    baseFee: number
    pricePerKm: number
    baseKm: number
  }
  whatsapp: {
    enabled: boolean
    phoneNumberId: string
    accessToken: string
    businessPhone: string
  }
  credits: {
    lowCreditsThreshold: number
    creditValue: number
    packages: CreditPackage[]
  }
  payments: {
    mercadopago: {
      enabled: boolean
      accessToken: string
      publicKey: string
      webhookSecret: string
    }
  }
}

export default function AdminSettingsPage() {
  const { isAdmin, isLoading: userLoading } = useUser()
  const router = useRouter()
  const [settings, setSettings] = useState<GlobalSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, userLoading, router])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()
      if (data?.whatsapp && !('accessToken' in data.whatsapp)) {
        data.whatsapp.accessToken = ""
      }
      setSettings(data)
    } catch (err) {
      console.error("Error fetching settings:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!response.ok) throw new Error("Error al guardar")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("Error al guardar la configuración")
    } finally {
      setIsSaving(false)
    }
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
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configuración global de la plataforma
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-success/10 p-3 text-sm text-success">
            Configuración guardada correctamente
          </div>
        )}

        {isLoading ? (
          <Loading text="Cargando configuración..." className="py-16" />
        ) : settings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
            {/* WhatsApp Business - más ancho */}
            <Card className="border-border/60 md:col-span-2 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  WhatsApp Business
                </CardTitle>
                <CardDescription className="text-xs">Integración con WhatsApp Business API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsappEnabled" className="text-sm">Notificaciones</Label>
                    <p className="text-[11px] text-muted-foreground">Enviar notificaciones automáticas</p>
                  </div>
                  <Switch
                    id="whatsappEnabled"
                    checked={settings.whatsapp.enabled}
                    onCheckedChange={(checked) =>
                      setSettings((prev) =>
                        prev ? { ...prev, whatsapp: { ...prev.whatsapp, enabled: checked } } : prev
                      )
                    }
                  />
                </div>
                <Separator />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumberId" className="text-xs">Phone Number ID</Label>
                    <Input
                      id="phoneNumberId"
                      value={settings.whatsapp.phoneNumberId}
                      disabled={!settings.whatsapp.enabled}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev ? { ...prev, whatsapp: { ...prev.whatsapp, phoneNumberId: e.target.value } } : prev
                        )
                      }
                      placeholder="ID del número"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsappAccessToken" className="text-xs">Access Token</Label>
                    <Input
                      id="whatsappAccessToken"
                      type="password"
                      value={settings.whatsapp.accessToken}
                      disabled={!settings.whatsapp.enabled}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev ? { ...prev, whatsapp: { ...prev.whatsapp, accessToken: e.target.value } } : prev
                        )
                      }
                      placeholder="EAAxxxxxx"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone" className="text-xs">Número WhatsApp Business</Label>
                  <Input
                    id="businessPhone"
                    value={settings.whatsapp.businessPhone}
                    disabled={!settings.whatsapp.enabled}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev ? { ...prev, whatsapp: { ...prev.whatsapp, businessPhone: e.target.value } } : prev
                      )
                    }
                    placeholder="5730012345678 (sin +)"
                    className="h-8 text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Formato internacional sin +. Para generar links de activación.
                  </p>
                </div>
                <div className="flex items-start gap-1.5 rounded-md bg-muted p-2">
                  <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                  <p className="text-[11px] text-muted-foreground">
                    Las credenciales se almacenan de forma segura en la base de datos.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pedidos */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-success" />
                  Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="directAssignmentTimeout" className="text-xs">Asignación directa (min)</Label>
                  <NumberInput
                    id="directAssignmentTimeout"
                    min={1}
                    value={settings.orders.directAssignmentTimeout}
                    onValueChange={(v) =>
                      setSettings((prev) =>
                        prev ? { ...prev, orders: { ...prev.orders, directAssignmentTimeout: v || 1 } } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderExpiryMinutes" className="text-xs">Expiración (min)</Label>
                  <NumberInput
                    id="orderExpiryMinutes"
                    min={5}
                    value={settings.orders.orderExpiryMinutes}
                    onValueChange={(v) =>
                      setSettings((prev) =>
                        prev ? { ...prev, orders: { ...prev.orders, orderExpiryMinutes: v || 5 } } : prev
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tarifas */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-warning" />
                  Tarifas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="baseFee" className="text-xs">Base ($)</Label>
                  <NumberInput
                    id="baseFee"
                    min={0}
                    value={settings.delivery?.baseFee ?? 5000}
                    onValueChange={(v) =>
                      setSettings((prev) =>
                        prev ? { ...prev, delivery: { ...prev.delivery, baseFee: v || 0 } } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseKm" className="text-xs">Km incluidos</Label>
                  <NumberInput
                    id="baseKm"
                    min={0}
                    value={settings.delivery?.baseKm ?? 0}
                    onValueChange={(v) =>
                      setSettings((prev) =>
                        prev ? { ...prev, delivery: { ...prev.delivery, baseKm: v || 0 } } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerKm" className="text-xs">Por km extra ($)</Label>
                  <NumberInput
                    id="pricePerKm"
                    min={0}
                    value={settings.delivery?.pricePerKm ?? 1500}
                    onValueChange={(v) =>
                      setSettings((prev) =>
                        prev ? { ...prev, delivery: { ...prev.delivery, pricePerKm: v || 0 } } : prev
                      )
                    }
                  />
                </div>
                <div className="rounded-md bg-muted p-2">
                  <p className="text-[11px] text-muted-foreground">
                    <strong>Fórmula:</strong> Base + max(0, km - Km incluidos) × Precio/km
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pagos */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-primary" />
                  MercadoPago
                </CardTitle>
                <CardDescription className="text-xs">Pasarela de pagos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mpEnabled" className="text-sm">Habilitar</Label>
                  <Switch
                    id="mpEnabled"
                    checked={settings.payments?.mercadopago?.enabled ?? false}
                    onCheckedChange={(checked) =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              payments: {
                                ...prev.payments,
                                mercadopago: { ...prev.payments?.mercadopago, enabled: checked },
                              },
                            }
                          : prev
                      )
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="mpAccessToken" className="text-xs">Access Token</Label>
                  <Input
                    id="mpAccessToken"
                    type="password"
                    value={settings.payments?.mercadopago?.accessToken ?? ""}
                    disabled={!settings.payments?.mercadopago?.enabled}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? {
                            ...prev,
                            payments: {
                              ...prev.payments,
                              mercadopago: { ...prev.payments?.mercadopago, accessToken: e.target.value },
                            },
                          }
                          : prev
                      )
                    }
                    placeholder="APP_USR-..."
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpPublicKey" className="text-xs">Public Key</Label>
                  <Input
                    id="mpPublicKey"
                    value={settings.payments?.mercadopago?.publicKey ?? ""}
                    disabled={!settings.payments?.mercadopago?.enabled}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? {
                            ...prev,
                            payments: {
                              ...prev.payments,
                              mercadopago: { ...prev.payments?.mercadopago, publicKey: e.target.value },
                            },
                          }
                          : prev
                      )
                    }
                    placeholder="APP_USR-..."
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpWebhookSecret" className="text-xs">Webhook Secret</Label>
                  <Input
                    id="mpWebhookSecret"
                    type="password"
                    value={settings.payments?.mercadopago?.webhookSecret ?? ""}
                    disabled={!settings.payments?.mercadopago?.enabled}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? {
                            ...prev,
                            payments: {
                              ...prev.payments,
                              mercadopago: { ...prev.payments?.mercadopago, webhookSecret: e.target.value },
                            },
                          }
                          : prev
                      )
                    }
                    placeholder="Tu webhook secret"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-start gap-1.5 rounded-md bg-muted p-2">
                  <Lock className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                  <p className="text-[11px] text-muted-foreground">
                    Credenciales seguras. Nunca visibles para usuarios.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Créditos - full width */}
            <div className="md:col-span-2 lg:col-span-3">
              <CreditsSection
                creditValue={settings.credits.creditValue}
                lowCreditsThreshold={settings.credits.lowCreditsThreshold}
                packages={settings.credits.packages || []}
                onCreditValueChange={(v) =>
                  setSettings((prev) =>
                    prev ? { ...prev, credits: { ...prev.credits, creditValue: v } } : prev
                  )
                }
                onLowThresholdChange={(v) =>
                  setSettings((prev) =>
                    prev ? { ...prev, credits: { ...prev.credits, lowCreditsThreshold: v } } : prev
                  )
                }
                onPackagesChange={(packages) =>
                  setSettings((prev) =>
                    prev ? { ...prev, credits: { ...prev.credits, packages } } : prev
                  )
                }
              />
            </div>

            {/* Admins - full width */}
            <div className="md:col-span-2 lg:col-span-3">
              <AdminsSection />
            </div>
          </div>
        ) : null}
      </div>

    </DashboardLayout>
  )
}
