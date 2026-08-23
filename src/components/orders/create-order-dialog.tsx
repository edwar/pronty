"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
  const [assignmentType, setAssignmentType] = useState<"direct" | "broadcast">("direct")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Pedido</DialogTitle>
          <DialogDescription>Completa los datos para crear un nuevo pedido.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5">
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-muted-foreground">Destinatario</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Nombre</Label>
                <Input id="recipientName" placeholder="Nombre completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Teléfono</Label>
                <Input id="recipientPhone" placeholder="+57 300 123 4567" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-medium text-muted-foreground">Recogida</h4>
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Dirección</Label>
              <Input id="pickupAddress" placeholder="Dirección de recogida" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupNotes">Notas</Label>
              <Textarea id="pickupNotes" placeholder="Instrucciones..." />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-medium text-muted-foreground">Entrega</h4>
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Dirección</Label>
              <Input id="deliveryAddress" placeholder="Dirección de entrega" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryNotes">Notas</Label>
              <Textarea id="deliveryNotes" placeholder="Instrucciones..." />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-medium text-muted-foreground">Paquete y Tarifa</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packageDescription">Descripción</Label>
                <Input id="packageDescription" placeholder="Contenido" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Tarifa ($)</Label>
                <Input id="fee" type="number" placeholder="5000" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-medium text-muted-foreground">Asignación</h4>
            <RadioGroup
              value={assignmentType}
              onValueChange={(v) => setAssignmentType(v as "direct" | "broadcast")}
              className="grid grid-cols-2 gap-3"
            >
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                <RadioGroupItem value="direct" id="direct" />
                <div>
                  <div className="text-sm font-medium">Directa</div>
                  <div className="text-[11px] text-muted-foreground">A un domiciliario específico</div>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                <RadioGroupItem value="broadcast" id="broadcast" />
                <div>
                  <div className="text-sm font-medium">Broadcast</div>
                  <div className="text-[11px] text-muted-foreground">A grupo de domiciliarios</div>
                </div>
              </label>
            </RadioGroup>

            {assignmentType === "direct" && (
              <div className="space-y-2">
                <Label>Domiciliario</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar domiciliario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drv-001">Carlos Mendoza — Motocicleta</SelectItem>
                    <SelectItem value="drv-002">Ana Pérez — Bicicleta</SelectItem>
                    <SelectItem value="drv-003">Luis Ramírez — Motocicleta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Crear Pedido</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
