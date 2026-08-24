import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { triggerOrderUpdate } from "@/lib/pusher-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        commerce: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
          },
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            vehicleType: true,
            licensePlate: true,
          },
        },
        statusLogs: {
          orderBy: { createdAt: "asc" },
        },
        rating: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error fetching order details:", error)
    return NextResponse.json({ error: "Error al obtener detalles del pedido" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, notes, driverId, deliveryAddress, recipientName, recipientPhone } = body

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    const updateData: any = {}
    if (notes !== undefined) updateData.notes = notes
    if (driverId !== undefined) updateData.driverId = driverId
    if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress
    if (recipientName !== undefined) updateData.recipientName = recipientName
    if (recipientPhone !== undefined) updateData.recipientPhone = recipientPhone

    if (status && status !== existingOrder.status) {
      updateData.status = status
      if (status === "DELIVERED") updateData.deliveredAt = new Date()
      if (status === "PICKED_UP") updateData.pickedUpAt = new Date()
      if (status === "CANCELLED") updateData.cancelledAt = new Date()
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        ...(status && status !== existingOrder.status
          ? {
              statusLogs: {
                create: {
                  from: existingOrder.status,
                  to: status,
                  note: `Estado actualizado a ${status}`,
                  actorId: session.user.id,
                },
              },
            }
          : {}),
      },
      include: {
        driver: true,
        statusLogs: { orderBy: { createdAt: "asc" } },
      },
    })

    if (status && status !== existingOrder.status) {
      await triggerOrderUpdate(existingOrder.commerceId, {
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        status,
        driverName: updatedOrder.driver?.fullName,
      })
    }

    return NextResponse.json({ message: "Pedido actualizado", order: updatedOrder })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Error al actualizar el pedido" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: { commerce: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      return NextResponse.json(
        { error: "No se puede cancelar un pedido entregado o previamente cancelado" },
        { status: 400 }
      )
    }

    const isRefundable = ["PENDING", "ASSIGNING_DIRECT", "ASSIGNING_BROADCAST"].includes(
      order.status
    )

    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          statusLogs: {
            create: {
              from: order.status,
              to: "CANCELLED",
              note: "Pedido cancelado por el comercio",
              actorId: session.user.id,
            },
          },
        },
      }),

      ...(isRefundable
        ? [
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
                description: `Reembolso por cancelación de pedido #${order.orderNumber}`,
                referenceId: order.orderNumber,
                createdBy: session.user.id,
              },
            }),
          ]
        : []),
    ])

    await triggerOrderUpdate(order.commerceId, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: "CANCELLED",
    })

    return NextResponse.json({ message: "Pedido cancelado correctamente", refunded: isRefundable })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json({ error: "Error al cancelar el pedido" }, { status: 500 })
  }
}
