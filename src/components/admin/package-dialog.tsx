"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Zap, Star } from "lucide-react"
import { NumberInput } from "@/components/ui/number-input"
import { cn } from "@/lib/utils"

interface CreditPackage {
  id: string
  name: string
  credits: number
  discount: number
  popular: boolean
  features: string[]
}

interface PackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pkg: CreditPackage | null
  creditValue: number
  onSave: (pkg: CreditPackage) => void
}

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)

export function PackageDialog({
  open,
  onOpenChange,
  pkg,
  creditValue,
  onSave,
}: PackageDialogProps) {
  const [formData, setFormData] = useState<CreditPackage>({
    id: "",
    name: "",
    credits: 20,
    discount: 0,
    popular: false,
    features: [],
  })
  const [featuresInput, setFeaturesInput] = useState("")

  useEffect(() => {
    if (pkg) {
      setFormData(pkg)
      setFeaturesInput(pkg.features.join(", "))
    } else {
      setFormData({
        id: `pkg-${Date.now()}`,
        name: "",
        credits: 20,
        discount: 0,
        popular: false,
        features: [],
      })
      setFeaturesInput("")
    }
  }, [pkg, open])

  const basePrice = formData.credits * creditValue
  const discountAmount = Math.round(basePrice * (formData.discount / 100))
  const finalPrice = basePrice - discountAmount
  const pricePerCredit = formData.credits > 0 ? Math.round(finalPrice / formData.credits) : 0

  const handleSave = () => {
    const features = featuresInput
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean)
    onSave({ ...formData, features })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{pkg ? "Editar Paquete" : "Nuevo Paquete"}</DialogTitle>
          <DialogDescription>
            Configura las características del paquete de créditos
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del paquete</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Básico, Profesional..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="credits">Créditos</Label>
                <NumberInput
                  id="credits"
                  min={1}
                  value={formData.credits}
                  onValueChange={(v) => setFormData({ ...formData, credits: v || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Descuento (%)</Label>
                <NumberInput
                  id="discount"
                  min={0}
                  max={100}
                  value={formData.discount}
                  onValueChange={(v) => setFormData({ ...formData, discount: v })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="popular">Marcar como popular</Label>
                <p className="text-xs text-muted-foreground">
                  Se destacará visualmente para el comercio
                </p>
              </div>
              <Switch
                id="popular"
                checked={formData.popular}
                onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="features">Características</Label>
              <Input
                id="features"
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="Separadas por coma: Créditos, Soporte, Dashboard"
              />
              <p className="text-xs text-muted-foreground">
                Separa cada característica con una coma
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Vista previa</Label>
            <div
              className={cn(
                "relative flex flex-col rounded-xl border p-5 transition-all",
                formData.popular
                  ? "border-primary bg-primary/5"
                  : "border-border/60"
              )}
            >
              {formData.popular && (
                <Badge className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                  Popular
                </Badge>
              )}
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{formData.name || "Nombre del paquete"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.credits} créditos
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{formatCOP(finalPrice)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCOP(pricePerCredit)}/crédito
                  </div>
                  {formData.discount > 0 && (
                    <div className="mt-1 flex items-center gap-1 justify-end">
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCOP(basePrice)}
                      </span>
                      <Badge variant="success" className="text-[9px] px-1 py-0">
                        -{formData.discount}%
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              <ul className="mt-3 space-y-2">
                {(featuresInput ? featuresInput.split(",").map((f) => f.trim()).filter(Boolean) : []).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!formData.name}>
            {pkg ? "Guardar cambios" : "Crear paquete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
