"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Square, MessageCircle } from "lucide-react"

function DriverStatusContent() {
  const searchParams = useSearchParams()
  const name = searchParams.get("name") || "Domiciliario"
  const [whatsappPhone, setWhatsappPhone] = useState("")

  useEffect(() => {
    fetch("/api/settings/public")
      .then(r => r.json())
      .then(data => setWhatsappPhone(data.phone || ""))
      .catch(() => {})
  }, [])

  const openWhatsApp = (text: string) => {
    if (!whatsappPhone) return
    const url = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white mb-2">
            <MessageCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pronty</h1>
          <p className="text-sm text-gray-500">Estado de disponibilidad</p>
        </div>

        {name && (
          <Card className="border-border/60">
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Domiciliario</p>
              <p className="text-lg font-semibold">{name}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <Card className="border-border/60 hover:border-green-500/50 transition-colors">
            <CardContent className="pt-6">
              <Button
                className="w-full h-16 text-base font-semibold bg-green-500 hover:bg-green-600 text-white"
                onClick={() => openWhatsApp("Empece")}
                disabled={!whatsappPhone}
              >
                <Play className="h-5 w-5 mr-2" />
                Empezar a trabajar
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Te activamos para recibir pedidos por WhatsApp
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 hover:border-red-500/50 transition-colors">
            <CardContent className="pt-6">
              <Button
                className="w-full h-16 text-base font-semibold bg-red-500 hover:bg-red-600 text-white"
                onClick={() => openWhatsApp("Pare")}
                disabled={!whatsappPhone}
              >
                <Square className="h-5 w-5 mr-2" />
                Dejar de trabajar
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Te desactivamos y no recibirás más pedidos
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-gray-400">
          Se abrirá tu WhatsApp con un mensaje automático
        </p>
      </div>
    </div>
  )
}

export default function DriverStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    }>
      <DriverStatusContent />
    </Suspense>
  )
}
