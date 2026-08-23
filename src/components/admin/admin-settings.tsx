"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, CreditCard, Users, Truck, Bell } from "lucide-react"

export function AdminSettings() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <CreditCard className="h-4 w-4" />
            Configuración de Créditos
          </CardTitle>
          <CardDescription>Ajusta los valores y comisiones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="creditValue">Valor del Crédito ($)</Label>
            <Input id="creditValue" type="number" defaultValue="4000" />
            <p className="text-xs text-muted-foreground">Valor en pesos colombianos por cada crédito</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="commission">Comisión por Entrega (%)</Label>
            <Input id="commission" type="number" defaultValue="10" />
            <p className="text-xs text-muted-foreground">Porcentaje de comisión al domiciliario</p>
          </div>
          <Button><Save className="mr-2 h-4 w-4" />Guardar</Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Truck className="h-4 w-4" />
            Configuración de Domiciliarios
          </CardTitle>
          <CardDescription>Ajustes para registro y gestión</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxDistance">Distancia Máxima (km)</Label>
            <Input id="maxDistance" type="number" defaultValue="10" />
            <p className="text-xs text-muted-foreground">Radio máximo de entrega</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignmentTimeout">Timeout (seg)</Label>
            <Input id="assignmentTimeout" type="number" defaultValue="30" />
            <p className="text-xs text-muted-foreground">Tiempo límite para tomar un pedido</p>
          </div>
          <Button><Save className="mr-2 h-4 w-4" />Guardar</Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="h-4 w-4" />
            Notificaciones
          </CardTitle>
          <CardDescription>Configura WhatsApp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsappToken">Token de WhatsApp API</Label>
            <Input id="whatsappToken" type="password" placeholder="EAAxxxxxx" />
            <p className="text-xs text-muted-foreground">Token de acceso a la API de WhatsApp Business</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumberId">Phone Number ID</Label>
            <Input id="phoneNumberId" placeholder="123456789" />
            <p className="text-xs text-muted-foreground">ID del número de teléfono</p>
          </div>
          <Button><Save className="mr-2 h-4 w-4" />Guardar</Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4" />
            Gestión de Usuarios
          </CardTitle>
          <CardDescription>Administra los usuarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3.5">
            <div>
              <p className="text-sm font-medium">Comercios Pendientes</p>
              <p className="text-xs text-muted-foreground">3 comercios esperando aprobación</p>
            </div>
            <Button variant="outline" size="sm">Verificar</Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3.5">
            <div>
              <p className="text-sm font-medium">Domiciliarios Pendientes</p>
              <p className="text-xs text-muted-foreground">7 esperando aprobación</p>
            </div>
            <Button variant="outline" size="sm">Revisar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
