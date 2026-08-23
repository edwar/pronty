"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loading } from "@/components/ui/loading"

export default function CommerceDashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard")
  }, [router])

  return <Loading fullpage text="Redirigiendo..." />
}
