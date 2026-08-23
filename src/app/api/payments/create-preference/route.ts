import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createMercadoPagoPreference } from "@/lib/mercadopago"

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    let commerce = await prisma.commerce.findUnique({
      where: { userId: session.user.id },
    })

    if (!commerce && (session.user as any).commerceId) {
      commerce = await prisma.commerce.findUnique({
        where: { id: (session.user as any).commerceId },
      })
    }

    if (!commerce) {
      return NextResponse.json({ error: "Comercio no encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const { packageId } = body

    if (!packageId) {
      return NextResponse.json({ error: "ID de paquete requerido" }, { status: 400 })
    }

    // Get global settings from DB (systemConfig)
    const config = await prisma.systemConfig.findUnique({
      where: { key: "global_settings" },
    })

    const globalSettings = (config?.value as any) || {}
    const creditSettings = globalSettings.credits || {}
    const mpSettings = globalSettings.payments?.mercadopago || {}

    if (mpSettings.enabled === false) {
      return NextResponse.json(
        { error: "La pasarela de pago con Mercado Pago no está habilitada en la plataforma" },
        { status: 400 }
      )
    }

    const accessToken = mpSettings.accessToken?.trim() || process.env.MERCADOPAGO_ACCESS_TOKEN || ""
    if (!accessToken) {
      return NextResponse.json(
        { error: "El Access Token de Mercado Pago no ha sido configurado en el panel de administración" },
        { status: 400 }
      )
    }

    const creditValue = creditSettings.creditValue ?? 200
    const packages = creditSettings.packages || []

    const selectedPkg = packages.find((p: any) => p.id === packageId)

    if (!selectedPkg) {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 })
    }

    const basePrice = selectedPkg.credits * creditValue
    const discountAmount = Math.round(basePrice * ((selectedPkg.discount || 0) / 100))
    const finalPrice = basePrice - discountAmount

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const externalReference = `${commerce.id}|${selectedPkg.id}|${selectedPkg.credits}|${Date.now()}`

    const preference = await createMercadoPagoPreference({
      accessToken,
      items: [
        {
          id: selectedPkg.id,
          title: `Pronty — Paquete ${selectedPkg.name} (${selectedPkg.credits} créditos)`,
          description: `Recarga de ${selectedPkg.credits} créditos para envíos de domicilios`,
          quantity: 1,
          currency_id: "COP",
          unit_price: finalPrice,
        },
      ],
      payer: {
        name: session.user.name || undefined,
        email: session.user.email || undefined,
      },
      external_reference: externalReference,
      back_urls: {
        success: `${baseUrl}/credits?status=success&credits=${selectedPkg.credits}`,
        failure: `${baseUrl}/credits?status=failure`,
        pending: `${baseUrl}/credits?status=pending`,
      },
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    })

    return NextResponse.json({
      initPoint: preference.init_point || preference.sandbox_init_point,
      preferenceId: preference.id,
    })
  } catch (error: any) {
    console.error("Error creating Mercado Pago preference:", error)
    return NextResponse.json(
      { error: error.message || "Error al generar la preferencia de pago" },
      { status: 500 }
    )
  }
}
