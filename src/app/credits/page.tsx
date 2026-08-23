"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CreditBalance } from "@/components/credits/credit-balance"
import { CreditPackages } from "@/components/credits/credit-packages"
import { TransactionHistory } from "@/components/credits/transaction-history"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"

function PaymentStatusBanner() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const credits = searchParams.get("credits")

  if (!status) return null

  if (status === "success") {
    return (
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-3 shadow-sm">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
        <div>
          <p className="font-semibold">¡Pago procesado con éxito!</p>
          <p className="text-xs text-emerald-600/90 mt-0.5">
            {credits ? `Se han acreditado +${credits} créditos a tu cuenta.` : "Tus créditos han sido acreditados a tu saldo."}
          </p>
        </div>
      </div>
    )
  }

  if (status === "failure") {
    return (
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3 shadow-sm">
        <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
        <div>
          <p className="font-semibold">El pago fue cancelado o no completado</p>
          <p className="text-xs text-destructive/90 mt-0.5">
            No se realizó ningún cobro a tu cuenta. Puedes intentarlo de nuevo cuando desees.
          </p>
        </div>
      </div>
    )
  }

  if (status === "pending") {
    return (
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm flex items-center gap-3 shadow-sm">
        <Clock className="h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <p className="font-semibold">Pago en proceso de verificación</p>
          <p className="text-xs text-amber-600/90 mt-0.5">
            Tu pago está siendo verificado. Tus créditos se actualizarán automáticamente una vez confirmado.
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default function CreditsPage() {
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

        <CreditBalance />

        <CreditPackages />

        <TransactionHistory />
      </div>
    </DashboardLayout>
  )
}
