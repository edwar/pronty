"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Plus, Pencil, Trash2, GripVertical, Check } from "lucide-react"
import { NumberInput } from "@/components/ui/number-input"
import { PackageDialog } from "@/components/admin/package-dialog"
import { cn } from "@/lib/utils"

interface CreditPackage {
  id: string
  name: string
  credits: number
  discount: number
  popular: boolean
  features: string[]
}

interface CreditsSectionProps {
  creditValue: number
  lowCreditsThreshold: number
  packages: CreditPackage[]
  onCreditValueChange: (value: number) => void
  onLowThresholdChange: (value: number) => void
  onPackagesChange: (packages: CreditPackage[]) => void
}

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)

export function CreditsSection({
  creditValue,
  lowCreditsThreshold,
  packages,
  onCreditValueChange,
  onLowThresholdChange,
  onPackagesChange,
}: CreditsSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPkg, setEditingPkg] = useState<CreditPackage | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleSavePackage = (pkg: CreditPackage) => {
    const exists = packages.find((p) => p.id === pkg.id)
    if (exists) {
      onPackagesChange(packages.map((p) => (p.id === pkg.id ? pkg : p)))
    } else {
      onPackagesChange([...packages, pkg])
    }
  }

  const handleDeletePackage = (id: string) => {
    onPackagesChange(packages.filter((p) => p.id !== id))
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    const newPackages = [...packages]
    const dragged = newPackages[draggedIndex]
    newPackages.splice(draggedIndex, 1)
    newPackages.splice(index, 0, dragged)
    onPackagesChange(newPackages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const movePackage = (index: number, direction: "up" | "down") => {
    const newPackages = [...packages]
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= packages.length) return
    const temp = newPackages[index]
    newPackages[index] = newPackages[newIndex]
    newPackages[newIndex] = temp
    onPackagesChange(newPackages)
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4 text-warning" />
          Créditos
        </CardTitle>
        <CardDescription>Sistema de créditos de la plataforma</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="creditValue">Valor por crédito (COP)</Label>
          <NumberInput
            id="creditValue"
            min={0}
            step={100}
            value={creditValue}
            onValueChange={onCreditValueChange}
          />
          <p className="text-xs text-muted-foreground">
            Valor monetario de cada crédito
          </p>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="lowCreditsThreshold">Umbral de créditos bajos</Label>
          <NumberInput
            id="lowCreditsThreshold"
            min={0}
            value={lowCreditsThreshold}
            onValueChange={onLowThresholdChange}
          />
          <p className="text-xs text-muted-foreground">
            Notificar al comercio cuando sus créditos lleguen a este nivel
          </p>
        </div>
        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Paquetes de Créditos</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingPkg(null)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Nuevo Paquete
            </Button>
          </div>

          <div className="space-y-2">
            {packages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 p-8 text-center">
                <CreditCard className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No hay paquetes configurados</p>
              </div>
            ) : (
              packages.map((pkg, index) => {
                const basePrice = pkg.credits * creditValue
                const discountAmount = Math.round(basePrice * (pkg.discount / 100))
                const finalPrice = basePrice - discountAmount

                return (
                  <div
                    key={pkg.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-sm cursor-grab active:cursor-grabbing",
                      pkg.popular ? "border-primary bg-primary/5" : "border-border/60",
                      draggedIndex === index && "opacity-50"
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => movePackage(index, "up")}
                        disabled={index === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <GripVertical className="h-3 w-3 rotate-180" />
                      </button>
                      <button
                        onClick={() => movePackage(index, "down")}
                        disabled={index === packages.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <GripVertical className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pkg.name}</span>
                        {pkg.popular && (
                          <Badge className="text-[9px] px-1 py-0">Popular</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{pkg.credits} créditos</span>
                        <span>•</span>
                        <span className="font-medium text-foreground">{formatCOP(finalPrice)}</span>
                        {pkg.discount > 0 && (
                          <>
                            <span>•</span>
                            <Badge variant="success" className="text-[9px] px-1 py-0">
                              -{pkg.discount}%
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditingPkg(pkg)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>

      <PackageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pkg={editingPkg}
        creditValue={creditValue}
        onSave={handleSavePackage}
      />
    </Card>
  )
}
