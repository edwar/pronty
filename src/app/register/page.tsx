"use client"

import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Building2, UserPlus, CheckCircle2 } from "lucide-react"
import { signUp } from "@/lib/auth-client"
import { Loading } from "@/components/ui/loading"
import { PasswordStrength } from "@/components/ui/password-strength"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("invite")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteData, setInviteData] = useState<{
    valid: boolean
    email?: string
    commerceName?: string
  } | null>(null)
  const [checkingInvite, setCheckingInvite] = useState(!!inviteToken)

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (inviteToken) {
      validateInvite(inviteToken)
    }
  }, [inviteToken])

  const validateInvite = async (token: string) => {
    try {
      const res = await fetch(`/api/invitations/${token}`)
      const data = await res.json()
      if (res.ok && data.valid) {
        setInviteData(data)
        setFormData(prev => ({
          ...prev,
          email: data.email || prev.email,
        }))
      } else {
        setError(data.error || "La invitación no es válida")
      }
    } catch {
      setError("Error al validar la invitación")
    } finally {
      setCheckingInvite(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const { data, error: signUpError } = await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.ownerName,
        callbackURL: "/dashboard",
      })

      if (signUpError) {
        setError(signUpError.message || "Error al crear la cuenta")
        return
      }

      // If completing an invitation, accept it
      if (inviteToken && inviteData?.valid) {
        await fetch("/api/commerce/invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: inviteToken }),
        })
      } else if (formData.businessName) {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commerce: {
              name: formData.businessName,
            },
          }),
        })
      }

      window.location.href = "/dashboard"
    } catch (err) {
      setError("Error al crear la cuenta. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingInvite) {
    return <Loading text="Validando invitación..." className="py-16" />
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {inviteData?.valid && (
            <div className="rounded-lg bg-primary/10 p-4 border border-primary/20 flex items-start gap-3">
              <Building2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-primary">¡Te han invitado a unirte a un negocio!</p>
                <p className="text-muted-foreground mt-0.5">
                  Estás completando tu registro para unirte al equipo de <strong>{inviteData.commerceName}</strong>.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!inviteData?.valid && (
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm font-medium">Nombre del Negocio</Label>
                <Input 
                  id="businessName" 
                  placeholder="Restaurante El Sabor"
                  value={formData.businessName}
                  onChange={handleChange}
                  required={!inviteData?.valid}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ownerName" className="text-sm font-medium">Tu Nombre Completo</Label>
              <Input 
                id="ownerName" 
                placeholder="Juan Pérez"
                value={formData.ownerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={!!inviteData?.valid}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
              <Input 
                id="phone" 
                type="tel"
                placeholder="+57 300 123 4567"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Contraseña</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <PasswordStrength
              password={formData.password}
              confirmPassword={formData.confirmPassword}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loading text="Creando cuenta..." className="flex-row gap-2" />
            ) : inviteData?.valid ? (
              "Aceptar e Iniciar Sesión"
            ) : (
              "Crear Cuenta"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="container mx-auto flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-md px-6 py-16">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Crear Cuenta</h1>
          <p className="text-sm text-muted-foreground">
            Registra tu negocio o únete a un equipo en Pronty
          </p>
        </div>

        <Suspense fallback={<Loading text="Cargando formulario..." className="py-16" />}>
          <RegisterForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </main>
    </div>
  )
}
