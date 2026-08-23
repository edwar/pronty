"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Loading } from "@/components/ui/loading"

interface CreditPackage {
  id: string
  name: string
  credits: number
  discount: number
  popular: boolean
  features: string[]
}

interface CreditSettings {
  creditValue: number
  lowCreditsThreshold: number
  packages: CreditPackage[]
}

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)

export function CreditPackages() {
  const [settings, setSettings] = useState<CreditSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()
      setSettings({
        creditValue: data.credits?.creditValue ?? 1000,
        lowCreditsThreshold: data.credits?.lowCreditsThreshold ?? 5,
        packages: data.credits?.packages ?? [],
      })
    } catch (err) {
      console.error("Error fetching settings:", err)
      setSettings({ creditValue: 1000, lowCreditsThreshold: 5, packages: [] })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex items-center justify-center py-16">
          <Loading text="Cargando paquetes..." />
        </CardContent>
      </Card>
    )
  }

  const creditValue = settings?.creditValue ?? 1000
  const packages = settings?.packages ?? []

  if (packages.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Zap className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">No hay paquetes configurados</p>
          <p className="text-xs text-muted-foreground">
            Configura los paquetes de créditos en la configuración de administración
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-primary" />
          Paquetes de Créditos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 p-5 pt-0">
        <div className="grid gap-4 lg:grid-cols-3">
          {packages.map((pkg) => {
            const basePrice = pkg.credits * creditValue
            const discountAmount = Math.round(basePrice * (pkg.discount / 100))
            const finalPrice = basePrice - discountAmount
            const pricePerCredit = pkg.credits > 0 ? Math.round(finalPrice / pkg.credits) : 0

            return (
              <div
                key={pkg.id}
                className={cn(
                  "relative flex flex-col rounded-xl border p-5 transition-all hover:shadow-sm",
                  pkg.popular
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:border-border"
                )}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                    Popular
                  </Badge>
                )}
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pkg.credits} créditos
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{formatCOP(finalPrice)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCOP(pricePerCredit)}/crédito
                    </div>
                    {pkg.discount > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCOP(basePrice)}
                        </span>
                        <Badge variant="success" className="text-[9px] px-1 py-0">
                          -{pkg.discount}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <ul className="mb-4 flex-1 space-y-2">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn("w-full", pkg.popular ? "" : "variant-outline")}
                  variant={pkg.popular ? "default" : "outline"}
                >
                  Comprar Paquete
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
