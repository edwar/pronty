"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Square, MessageCircle } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { Logo } from "@/components/logo"

function DriverStatusContent() {
  const searchParams = useSearchParams()
  const name = searchParams.get("name") || "Domiciliario"
  const [whatsappPhone, setWhatsappPhone] = useState("")
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    fetch("/api/settings/public")
      .then(r => r.json())
      .then(data => setWhatsappPhone(data.phone || ""))
      .catch(() => {})
  }, [])

  const openWhatsApp = (text: string) => {
    if (!whatsappPhone) {
      showToast("El número de WhatsApp no está configurado. Contacta al administrador.")
      return
    }
    const url = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/">
            <Logo className="h-9 w-9" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Iniciar Sesión
            </Link>
            <Button size="sm">
              <Link href="/drivers/register">Ser Domiciliario</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-lg px-6 py-16">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/8 px-3.5 py-1 text-xs font-medium text-primary">
            <MessageCircle className="h-3.5 w-3.5" />
            Domiciliario
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Estado de disponibilidad</h1>
          <p className="text-sm text-muted-foreground">Activa o desactiva tu cuenta para recibir pedidos</p>
        </div>

        <Card className="border-border/60 shadow-sm mb-6">
          <CardContent className="pt-6 pb-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Domiciliario</p>
            <p className="text-lg font-semibold">{name}</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button
            className="w-full h-14 text-base font-semibold bg-green-500 hover:bg-green-600 text-white"
            onClick={() => openWhatsApp("Empece")}
          >
            <Play className="h-5 w-5 mr-2" />
            Empezar a trabajar
          </Button>
          <p className="text-xs text-muted-foreground text-center -mt-2">
            Te activamos para recibir pedidos por WhatsApp
          </p>

          <Button
            className="w-full h-14 text-base font-semibold bg-red-500 hover:bg-red-600 text-white"
            onClick={() => openWhatsApp("Pare")}
          >
            <Square className="h-5 w-5 mr-2" />
            Dejar de trabajar
          </Button>
          <p className="text-xs text-muted-foreground text-center -mt-2">
            Te desactivamos y no recibirás más pedidos
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Se abrirá tu WhatsApp con un mensaje automático
        </p>
      </main>
      {ToastComponent}
    </div>
  )
}

export default function DriverStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    }>
      <DriverStatusContent />
    </Suspense>
  )
}
