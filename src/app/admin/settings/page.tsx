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
import { Package, MessageCircle, Save, Info, Loader2, CreditCard, Lock } from "lucide-react"
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
    broadcastTimeout: number
    orderExpiryMinutes: number
  }
  whatsapp: {
    enabled: boolean
    phoneNumberId: string
    checkInIntervalMinutes: number
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
      <div className="space-y-8">
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
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-4 w-4 text-success" />
                    Pedidos
                  </CardTitle>
                  <CardDescription>Tiempos de asignación y expiración</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="directAssignmentTimeout">Asignación directa (min)</Label>
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
                      <p className="text-xs text-muted-foreground">
                        Tiempo que tiene un domiciliario para aceptar
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="broadcastTimeout">Broadcast (min)</Label>
                      <NumberInput
                        id="broadcastTimeout"
                        min={1}
                        value={settings.orders.broadcastTimeout}
                        onValueChange={(v) =>
                          setSettings((prev) =>
                            prev ? { ...prev, orders: { ...prev.orders, broadcastTimeout: v || 1 } } : prev
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Duración del broadcast de pedidos
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="orderExpiryMinutes">Expiración del pedido (min)</Label>
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
                    <p className="text-xs text-muted-foreground">
                      Tiempo máximo sin asignar antes de expirar
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    WhatsApp
                  </CardTitle>
                  <CardDescription>Integración con WhatsApp Business API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="whatsappEnabled">Notificaciones por WhatsApp</Label>
                      <p className="text-xs text-muted-foreground">
                        Enviar notificaciones automáticas por WhatsApp
                      </p>
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
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                    <Input
                      id="phoneNumberId"
                      value={settings.whatsapp.phoneNumberId}
                      disabled={!settings.whatsapp.enabled}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev ? { ...prev, whatsapp: { ...prev.whatsapp, phoneNumberId: e.target.value } } : prev
                        )
                      }
                      placeholder="ID del número de WhatsApp Business"
                    />
                  <div className="flex items-start gap-1.5 rounded-md bg-muted p-2.5">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      El token de acceso se configura en esta sección.
                      Se almacena de forma segura en la base de datos.
                    </p>
                  </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="checkInInterval">Intervalo de check-in (min)</Label>
                    <NumberInput
                      id="checkInInterval"
                      min={5}
                      max={120}
                      value={settings.whatsapp.checkInIntervalMinutes}
                      onValueChange={(v) =>
                        setSettings((prev) =>
                          prev ? { ...prev, whatsapp: { ...prev.whatsapp, checkInIntervalMinutes: v || 30 } } : prev
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Minutos entre mensajes de confirmación a domiciliarios activos
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Pasarela de Pagos
                  </CardTitle>
                  <CardDescription>Configuración de MercadoPago para cobros</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mpEnabled">Habilitar MercadoPago</Label>
                      <p className="text-xs text-muted-foreground">
                        Aceptar pagos con MercadoPago
                      </p>
                    </div>
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
                    <Label htmlFor="mpAccessToken">Access Token</Label>
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
                    />
                    <p className="text-xs text-muted-foreground">
                      Token de acceso de producción de MercadoPago
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="mpPublicKey">Public Key</Label>
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
                    />
                    <p className="text-xs text-muted-foreground">
                      Llave pública para el checkout del comercio
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="mpWebhookSecret">Webhook Secret</Label>
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
                    />
                    <p className="text-xs text-muted-foreground">
                      Secreto para validar notificaciones de pago
                    </p>
                  </div>
                  <div className="flex items-start gap-1.5 rounded-md bg-muted p-2.5">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Las credenciales se almacenan de forma segura en la base de datos.
                      Nunca serán visibles para los usuarios finales.
                    </p>
                  </div>
                </CardContent>
              </Card>

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

            <AdminsSection />
          </div>
        ) : null}
      </div>

    </DashboardLayout>
  )
}
