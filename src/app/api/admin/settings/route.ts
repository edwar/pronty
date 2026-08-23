import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const defaultGlobalSettings = {
  commissions: {
    driverRate: 0,
    platformFee: 1000,
  },
  orders: {
    directAssignmentTimeout: 5,
    broadcastTimeout: 3,
    orderExpiryMinutes: 30,
  },
  whatsapp: {
    enabled: false,
    phoneNumberId: "",
    checkInIntervalMinutes: 1600,
  },
  credits: {
    lowCreditsThreshold: 5,
    creditValue: 1000,
    packages: [
      {
        id: "pkg-1",
        name: "Básico",
        credits: 20,
        discount: 0,
        popular: false,
        features: ["20 créditos", "Soporte por email", "Dashboard básico"],
      },
      {
        id: "pkg-2",
        name: "Profesional",
        credits: 50,
        discount: 10,
        popular: true,
        features: ["50 créditos", "Soporte prioritario", "Dashboard completo", "Estadísticas avanzadas"],
      },
      {
        id: "pkg-3",
        name: "Enterprise",
        credits: 150,
        discount: 20,
        popular: false,
        features: ["150 créditos", "Soporte 24/7", "Dashboard completo", "API acceso", "Account manager"],
      },
    ],
  },
  payments: {
    mercadopago: {
      enabled: false,
      accessToken: "",
      publicKey: "",
      webhookSecret: "",
    },
  },
}

export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "global_settings" },
    })

    return NextResponse.json(config?.value ?? defaultGlobalSettings)
  } catch (error) {
    console.error("Error fetching global settings:", error)
    return NextResponse.json(defaultGlobalSettings)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    await prisma.systemConfig.upsert({
      where: { key: "global_settings" },
      update: {
        value: body,
        updatedAt: new Date(),
      },
      create: {
        key: "global_settings",
        value: body,
        description: "Configuración global de la plataforma",
      },
    })

    return NextResponse.json({ message: "Configuración actualizada correctamente" })
  } catch (error) {
    console.error("Error updating global settings:", error)
    return NextResponse.json(
      { error: "Error al actualizar la configuración" },
      { status: 500 }
    )
  }
}
