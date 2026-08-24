import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { triggerOrderUpdate } from "@/lib/pusher-utils"

const STUCK_THRESHOLD_MINUTES = 30

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

    const threshold = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000)

    const stuckOrders = await prisma.order.findMany({
      where: {
        commerceId: commerce.id,
        status: {
          in: ["PENDING", "ASSIGNING_DIRECT", "ASSIGNING_BROADCAST"],
        },
        createdAt: {
          lt: threshold,
        },
      },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
      },
    })

    if (stuckOrders.length === 0) {
      return NextResponse.json({ cancelled: 0, orders: [] })
    }

    const results = await Promise.allSettled(
      stuckOrders.map(async (order) => {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: {
              status: "EXPIRED",
              expiresAt: new Date(),
              statusLogs: {
                create: {
                  from: order.status,
                  to: "EXPIRED",
                  note: `Pedido expirado automáticamente: más de ${STUCK_THRESHOLD_MINUTES} min sin ser aceptado`,
                  actorId: "SYSTEM",
                },
              },
            },
          }),
          prisma.commerce.update({
            where: { id: commerce!.id },
            data: { credits: { increment: 1 } },
          }),
          prisma.transaction.create({
            data: {
              commerceId: commerce!.id,
              type: "REFUND",
              credits: 1,
              balance: commerce!.credits + 1,
              description: `Reembolso por expiración automática de pedido #${order.orderNumber}`,
              referenceId: order.orderNumber,
              createdBy: "SYSTEM",
            },
          }),
        ])

        await triggerOrderUpdate(commerce!.id, {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: "EXPIRED",
        })
      })
    )

    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    return NextResponse.json({
      cancelled: successful,
      failed,
      orders: stuckOrders.map((o) => o.orderNumber),
    })
  } catch (error) {
    console.error("Error expiring stuck orders:", error)
    return NextResponse.json({ error: "Error al procesar pedidos" }, { status: 500 })
  }
}
