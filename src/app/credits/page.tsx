import { Suspense } from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CreditBalance } from "@/components/credits/credit-balance"
import { CreditPackages } from "@/components/credits/credit-packages"
import { TransactionHistory } from "@/components/credits/transaction-history"
import { PaymentStatusBanner } from "@/components/credits/payment-status-banner"
import { getCommerceCreditsData } from "./actions"

export default async function CreditsPage() {
  let data
  try {
    data = await getCommerceCreditsData()
  } catch {
    redirect("/login")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créditos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestiona y recarga tus créditos para envíos</p>
        </div>

        <Suspense fallback={null}>
          <PaymentStatusBanner />
        </Suspense>

        <CreditBalance 
          balance={data.balance} 
          purchased={data.purchasedThisMonth} 
          consumed={data.consumedTotal} 
          lastPackage={data.lastPackageSize} 
          lastPackageSubtitle={data.lastPackageDescription} 
        />

        <CreditPackages />

        <TransactionHistory transactions={data.recentTransactions} />
      </div>
    </DashboardLayout>
  )
}
