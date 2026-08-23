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

  // Si isPending es true O si todavía no hay objeto session pero tampoco hubo un error, seguimos cargando.
  const isLoading = isPending || (!session && !error)

  return {
    user: user ?? null,
    session: session ?? null,
    isLoading,
    role: user?.role,
    isAdmin: user?.role === "ADMIN_MASTER",
    isCommercant: user?.role === "COMMERCER",
    isDriver: user?.role === "DRIVER",
  }
}