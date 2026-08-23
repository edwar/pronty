"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, MinusCircle, RefreshCw, Settings, History } from "lucide-react"
import { cn } from "@/lib/utils"

interface Transaction {
  id: string
  type: string
  credits: number
  balance: number
  description: string | null
  createdAt: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const typeConfig: Record<string, { label: string; icon: typeof ShoppingCart; color: string; bg: string }> = {
    PURCHASE: { label: "Compra", icon: ShoppingCart, color: "text-success", bg: "bg-success/10" },
    CONSUMPTION: { label: "Consumo", icon: MinusCircle, color: "text-destructive", bg: "bg-destructive/10" },
    REFUND: { label: "Reembolso", icon: RefreshCw, color: "text-warning", bg: "bg-warning/10" },
    ADJUSTMENT: { label: "Ajuste", icon: Settings, color: "text-muted-foreground", bg: "bg-muted" },
  }

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
                    <span className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short" }).format(new Date(txn.createdAt))}
                    </span>
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
