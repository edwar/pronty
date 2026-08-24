import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const STUCK_THRESHOLD_MINUTES = 30

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const threshold = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000)

    const stuckOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ["PENDING", "ASSIGNING_DIRECT", "ASSIGNING_BROADCAST"],
        },
        createdAt: {
          lt: threshold,
        },
      },
      include: {
        commerce: true,
      },
    })

    if (stuckOrders.length === 0) {
      return NextResponse.json({ cancelled: 0, orders: [] })
    }

    const results = await Promise.allSettled(
      stuckOrders.map(async (order) => {
        return prisma.$transaction([
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
            where: { id: order.commerceId },
            data: { credits: { increment: 1 } },
          }),
          prisma.transaction.create({
            data: {
              commerceId: order.commerceId,
              type: "REFUND",
              credits: 1,
              balance: order.commerce.credits + 1,
              description: `Reembolso por expiración automática de pedido #${order.orderNumber}`,
              referenceId: order.orderNumber,
              createdBy: "SYSTEM",
            },
          }),
        ])
      })
    )

    const successful = results.filter((r) => r.status === "fulfilled").length

    return NextResponse.json({
      cancelled: successful,
      orders: stuckOrders.map((o) => o.orderNumber),
    })
  } catch (error) {
    console.error("Error expiring stuck orders:", error)
    return NextResponse.json({ error: "Error al procesar pedidos" }, { status: 500 })
  }
}
