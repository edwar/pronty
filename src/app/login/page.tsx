"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { signIn } from "@/lib/auth-client"
import { Loading } from "@/components/ui/loading"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data, error: signInError } = await signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: "/dashboard",
      })

      if (signInError) {
        setError(signInError.message || "Credenciales incorrectas")
        return
      }

      router.push("/dashboard")
    } catch (err) {
      setError("Error al iniciar sesión. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

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
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Iniciar Sesión</h1>
          <p className="text-sm text-muted-foreground">
            Accede a tu panel de Pronty
          </p>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loading text="Iniciando sesión..." className="flex-row gap-2" /> : "Iniciar Sesión"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">O</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full">
                Continuar con WhatsApp
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </main>
    </div>
  )
}
