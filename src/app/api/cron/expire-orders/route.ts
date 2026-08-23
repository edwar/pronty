import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Definimos el límite: 1 hora atrás
    const threshold = new Date(Date.now() - 60 * 60 * 1000)

    // Buscamos pedidos que estén pendientes o asignando, creados antes del umbral
    const expiredOrders = await prisma.order.findMany({
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

    if (expiredOrders.length === 0) {
      return NextResponse.json({ status: "ok", message: "No expired orders found" })
    }

    // Procesamos la cancelación de cada uno, incluyendo el reembolso
    const results = await Promise.allSettled(
      expiredOrders.map(async (order) => {
        return prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: {
              status: "EXPIRED",
              expiresAt: new Date(), // Using expiresAt instead of cancelledAt based on state
              statusLogs: {
                create: {
                  from: order.status,
                  to: "EXPIRED",
                  note: "Pedido expirado automáticamente por sistema tras 1 hora",
                  actorId: "SYSTEM",
                },
              },
            },
          }),
          // Reembolsar el crédito gastado al crear el pedido
          prisma.commerce.update({
            where: { id: order.commerceId },
            data: { credits: { increment: 1 } },
          }),
          prisma.transaction.create({
            data: {
              commerceId: order.commerceId,
              type: "REFUND",
              credits: 1,
              balance: order.commerce.credits + 1, // Nota: En transacciones concurrentes esto puede ser inexacto, pero es la lógica existente.
              description: `Reembolso por expiración automática de pedido #${order.orderNumber}`,
              referenceId: order.orderNumber,
              createdBy: "SYSTEM",
            },
          }),
        ])
      })
    )

    const successful = results.filter(r => r.status === "fulfilled").length
    const failed = results.filter(r => r.status === "rejected").length

    return NextResponse.json({ 
      status: "ok", 
      message: `Processed ${expiredOrders.length} orders`,
      successful,
      failed
    })
  } catch (error) {
    console.error("Error expiring orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
