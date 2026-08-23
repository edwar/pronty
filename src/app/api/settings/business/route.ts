import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const defaultBusiness = {
  orderPrefix: "ORD",
  workingHours: {
    monday: { open: "08:00", close: "20:00", active: true },
    tuesday: { open: "08:00", close: "20:00", active: true },
    wednesday: { open: "08:00", close: "20:00", active: true },
    thursday: { open: "08:00", close: "20:00", active: true },
    friday: { open: "08:00", close: "20:00", active: true },
    saturday: { open: "09:00", close: "18:00", active: true },
    sunday: { open: "09:00", close: "14:00", active: false },
  },
  deliveryZones: ["centro", "norte", "sur"],
  maxDeliveryDistance: 5,
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const config = await prisma.systemConfig.findUnique({
      where: { key: `business_${session.user.id}` },
    })

    return NextResponse.json(config?.value || defaultBusiness)
  } catch (error) {
    console.error("Error fetching business settings:", error)
    return NextResponse.json(defaultBusiness)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()

    await prisma.systemConfig.upsert({
      where: { key: `business_${session.user.id}` },
      update: { value: body },
      create: {
        key: `business_${session.user.id}`,
        value: body,
      },
    })

    return NextResponse.json({ message: "Configuración del negocio actualizada" })
  } catch (error) {
    console.error("Error updating business settings:", error)
    return NextResponse.json(
      { error: "Error al actualizar la configuración del negocio" },
      { status: 500 }
    )
  }
}
