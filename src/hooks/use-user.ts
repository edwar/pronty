"use client"

import { useSession } from "@/lib/auth-client"

interface UserWithRole {
  id: string
  email: string
  name: string | null
  image?: string | null
  role?: string
  phone?: string | null
}

export function useUser() {
  const { data: session, isPending, error } = useSession()
  const user = session?.user as UserWithRole | undefined

  // Solo se considera cargado si isPending es false Y (tenemos datos de sesión o dió error)
  const isLoading = isPending

  return {
    user: user ?? null,
    session: session ?? null,
    isLoading,
    isAdmin: user?.role === "ADMIN_MASTER",
    isCommercant: user?.role === "COMMERCER",
    isDriver: user?.role === "DRIVER",
  }
}