"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { Loading } from "@/components/ui/loading"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function SettingsRedirect() {
  const { isAdmin, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAdmin) {
        router.replace("/admin/settings")
      } else {
        router.replace("/settings/commercant")
      }
    }
  }, [isAdmin, isLoading, router])

  return (
    <DashboardLayout>
      <Loading fullpage text="Redirigiendo..." />
    </DashboardLayout>
  )
}
