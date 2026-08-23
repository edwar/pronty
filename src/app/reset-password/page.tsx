"use client"

import Link from "next/link"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordStrength } from "@/components/ui/password-strength"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
                <Lock className="h-7 w-7 text-destructive" />
              </div>
              <h1 className="mb-2 text-xl font-semibold">Enlace inválido</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                El enlace de recuperación no es válido o ha expirado.
              </p>
              <Button variant="outline" onClick={() => window.location.href = "/forgot-password"}>
                Solicitar nuevo enlace
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <h1 className="mb-2 text-xl font-semibold">Contraseña actualizada</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión.
              </p>
              <Button variant="outline" onClick={() => window.location.href = "/login"}>
                Iniciar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || "Error al restablecer la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border/60 shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Restablecer contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <PasswordStrength password={password} confirmPassword={confirmPassword} />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loading text="Actualizando..." className="flex-row gap-2" />
              ) : (
                "Restablecer contraseña"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loading text="Cargando..." />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
