"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhoneInput } from "@/components/ui/phone-input"
import { ArrowLeft, CheckCircle2, Zap } from "lucide-react"
import { Loading } from "@/components/ui/loading"

export default function DriverRegisterPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    vehicleType: "",
    licensePlate: "",
    city: "",
  })

  const colombianCities = [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga",
    "Cartagena", "Cúcuta", "Ibagué", "Pereira", "Santa Marta",
    "Villavicencio", "Manizales", "Neiva", "Pasto", "Armenia",
    "Popayán", "Montería", "Sincelejo", "Valledupar", "Tulúa",
    "Girardot", "Tocaima", "Flandes", "Ricaurte", "Agua de Dios",
    "Melgar", "Cajicá", "Chía", "Cota", "Soacha",
    "Facatativá", "Fusagasugá", "Zipaquirá", "Ubaté", "Villeta",
    "Nimaima", "Nocaima", "Quebradanegra", "San Antonio del Tequendama",
    "Bojacá", "Mosquera", "Funza", "Madrid", "Subachoque",
    "El Colegio", "Anapoima", "Apaneca", "Apulo", "La Mesa",
    "Tena", "Viotá", "Cogua", "Sesquilé", "Suesca",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleSelectChange = (name: string, value: string | null) => {
    setFormData(prev => ({ ...prev, [name]: value ?? "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al enviar la solicitud")
        return
      }

      setIsSubmitted(true)
    } catch (err) {
      setError("Error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <h1 className="mb-2 text-xl font-semibold">¡Solicitud Enviada!</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                Tu solicitud ha sido recibida. Recibirás un mensaje de WhatsApp
                cuando tu cuenta sea aprobada.
              </p>
              <Button><Link href="/">Volver al Inicio</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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

      <main className="container mx-auto max-w-lg px-6 py-16">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/8 px-3.5 py-1 text-xs font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            Únete a Pronty
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Ser Domiciliario</h1>
          <p className="text-sm text-muted-foreground">Regístrate para empezar a recibir pedidos en tu zona</p>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Completa tus datos para crear tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Tu nombre completo" 
                    value={formData.fullName}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
                  <PhoneInput
                    id="phone"
                    value={formData.phone}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Recibirás notificaciones por este número</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Tipo de Vehículo</Label>
                  <Select 
                    required
                    value={formData.vehicleType}
                    onValueChange={(value) => handleSelectChange("vehicleType", value)}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar vehículo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BICYCLE">Bicicleta</SelectItem>
                      <SelectItem value="MOTORCYCLE">Motocicleta</SelectItem>
                      <SelectItem value="CAR">Carro</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">Placa del Vehículo (opcional)</Label>
                  <Input 
                    id="licensePlate" 
                    placeholder="ABC 123" 
                    value={formData.licensePlate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Select 
                    required
                    value={formData.city}
                    onValueChange={(value) => handleSelectChange("city", value)}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar ciudad" /></SelectTrigger>
                    <SelectContent>
                      {colombianCities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Ciudad donde trabajarás</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="tu@email.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">Recibirás las instrucciones de activación en este correo</p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loading text="Enviando..." className="flex-row gap-2" /> : "Enviar Solicitud"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Al enviar, aceptas nuestros{" "}
                <Link href="/terms" className="text-primary hover:underline">términos y condiciones</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
