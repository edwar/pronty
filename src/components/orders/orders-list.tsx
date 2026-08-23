"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, MapPin, Clock, User } from "lucide-react"

const orders = [
  {
    id: "ORD-001",
    recipient: "María García",
    phone: "+57 300 123 4567",
    delivery: "Calle 12 #45-67, Centro",
    status: "IN_TRANSIT",
    driver: "Carlos Mendoza",
    fee: "$5.000",
    createdAt: "Hace 5 min",
  },
  {
    id: "ORD-002",
    recipient: "Juan López",
    phone: "+57 301 234 5678",
    delivery: "Av. Principal #89-12, Norte",
    status: "DELIVERED",
    driver: "Ana Pérez",
    fee: "$4.500",
    createdAt: "Hace 25 min",
  },
  {
    id: "ORD-003",
    recipient: "Pedro Martínez",
    phone: "+57 302 345 6789",
    delivery: "Calle 5 #23-45, Sur",
    status: "PENDING",
    driver: null,
    fee: "$3.500",
    createdAt: "Hace 2 min",
  },
  {
    id: "ORD-004",
    recipient: "Laura Sánchez",
    phone: "+57 303 456 7890",
    delivery: "Carrera 8 #34-56, Este",
    status: "ASSIGNING_DIRECT",
    driver: "Luis Ramírez",
    fee: "$4.000",
    createdAt: "Hace 1 min",
  },
  {
    id: "ORD-005",
    recipient: "Roberto Díaz",
    phone: "+57 304 567 8901",
    delivery: "Calle 15 #67-89, Oeste",
    status: "CANCELLED",
    driver: null,
    fee: "$5.500",
    createdAt: "Hace 1 hora",
  },
]

const statusConfig = {
  PENDING: { label: "Pendiente", variant: "warning" as const },
  ASSIGNING_DIRECT: { label: "Asignando", variant: "default" as const },
  IN_TRANSIT: { label: "En Entrega", variant: "default" as const },
  DELIVERED: { label: "Entregado", variant: "success" as const },
  CANCELLED: { label: "Cancelado", variant: "destructive" as const },
}

export function OrdersList() {
  return (
    <div className="rounded-xl border border-border/60">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="text-xs font-medium">Pedido</TableHead>
            <TableHead className="text-xs font-medium">Destinatario</TableHead>
            <TableHead className="text-xs font-medium">Entrega</TableHead>
            <TableHead className="text-xs font-medium">Estado</TableHead>
            <TableHead className="text-xs font-medium">Domiciliario</TableHead>
            <TableHead className="text-xs font-medium">Tarifa</TableHead>
            <TableHead className="text-xs font-medium">Tiempo</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig]
            return (
              <TableRow key={order.id} className="border-border/60">
                <TableCell>
                  <span className="text-sm font-medium">{order.id}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm font-medium">{order.recipient}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {order.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[180px]">{order.delivery}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{order.driver || "Sin asignar"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{order.fee}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {order.createdAt}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Cancelar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
