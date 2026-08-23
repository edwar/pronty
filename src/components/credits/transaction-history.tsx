"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, MinusCircle, RefreshCw, Settings, History } from "lucide-react"
import { cn } from "@/lib/utils"

const transactions = [
  { id: "TXN-001", type: "PURCHASE", credits: 50, balance: 156, description: "Paquete Profesional", date: "Hoy, 10:30 AM" },
  { id: "TXN-002", type: "CONSUMPTION", credits: -1, balance: 106, description: "Pedido ORD-001", date: "Hoy, 9:45 AM" },
  { id: "TXN-003", type: "CONSUMPTION", credits: -1, balance: 107, description: "Pedido ORD-002", date: "Hoy, 9:30 AM" },
  { id: "TXN-004", type: "PURCHASE", credits: 100, balance: 108, description: "Paquete Enterprise", date: "Ayer, 3:15 PM" },
  { id: "TXN-005", type: "ADJUSTMENT", credits: 10, balance: 8, description: "Ajuste manual por admin", date: "Ayer, 11:00 AM" },
]

const typeConfig: Record<string, { label: string; icon: typeof ShoppingCart; color: string; bg: string }> = {
  PURCHASE: { label: "Compra", icon: ShoppingCart, color: "text-success", bg: "bg-success/10" },
  CONSUMPTION: { label: "Consumo", icon: MinusCircle, color: "text-destructive", bg: "bg-destructive/10" },
  REFUND: { label: "Reembolso", icon: RefreshCw, color: "text-warning", bg: "bg-warning/10" },
  ADJUSTMENT: { label: "Ajuste", icon: Settings, color: "text-muted-foreground", bg: "bg-muted" },
}

export function TransactionHistory() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-muted-foreground" />
          Historial de Transacciones
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="pl-5 text-xs font-medium uppercase tracking-wider">Tipo</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider">Créditos</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider">Saldo</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider">Descripción</TableHead>
              <TableHead className="pr-5 text-right text-xs font-medium uppercase tracking-wider">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => {
              const type = typeConfig[txn.type] ?? typeConfig.ADJUSTMENT
              const TypeIcon = type.icon
              return (
                <TableRow key={txn.id} className="border-border/40">
                  <TableCell className="pl-5">
                    <Badge variant="outline" className={cn("gap-1 text-[10px]", type.color)}>
                      <TypeIcon className="h-3 w-3" />
                      {type.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        txn.credits > 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {txn.credits > 0 ? "+" : ""}
                      {txn.credits}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{txn.balance}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{txn.description}</span>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <span className="text-xs text-muted-foreground">{txn.date}</span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
