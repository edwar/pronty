import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const defaultNotifications = {
  emailNewOrder: true,
  emailOrderAssigned: true,
  emailLowCredits: true,
  whatsappNewOrder: false,
  whatsappOrderAssigned: false,
  whatsappLowCredits: true,
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
      where: { key: `notifications_${session.user.id}` },
    })

    return NextResponse.json(config?.value || defaultNotifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(defaultNotifications)
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
      where: { key: `notifications_${session.user.id}` },
      update: { value: body },
      create: {
        key: `notifications_${session.user.id}`,
        value: body,
      },
    })

    return NextResponse.json({ message: "Notificaciones actualizadas" })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json(
      { error: "Error al actualizar notificaciones" },
      { status: 500 }
    )
  }
}
