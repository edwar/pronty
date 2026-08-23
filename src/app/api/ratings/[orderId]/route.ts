import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
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

    const { orderId } = await params
    const body = await request.json()
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La calificación debe ser entre 1 y 5" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { commerce: true },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    if (order.commerce.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para calificar este pedido" },
        { status: 403 }
      )
    }

    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "Solo puedes calificar pedidos entregados" },
        { status: 400 }
      )
    }

    if (!order.driverId) {
      return NextResponse.json(
        { error: "Este pedido no tiene domiciliario asignado" },
        { status: 400 }
      )
    }

    const existingRating = await prisma.rating.findUnique({
      where: { orderId },
    })

    if (existingRating) {
      return NextResponse.json(
        { error: "Este pedido ya fue calificado" },
        { status: 400 }
      )
    }

    const newRating = await prisma.rating.create({
      data: {
        orderId,
        commerceId: order.commerceId,
        driverId: order.driverId,
        rating,
        comment: comment || null,
      },
    })

    return NextResponse.json(newRating, { status: 201 })
  } catch (error) {
    console.error("Error creating rating:", error)
    return NextResponse.json(
      { error: "Error al crear la calificación" },
      { status: 500 }
    )
  }
}
