"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CreditBalance } from "@/components/credits/credit-balance"
import { CreditPackages } from "@/components/credits/credit-packages"
import { TransactionHistory } from "@/components/credits/transaction-history"

export default function CreditsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créditos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestiona tus créditos para envíos</p>
        </div>

        <CreditBalance />

        <CreditPackages />

        <TransactionHistory />
      </div>
    </DashboardLayout>
  )
}
