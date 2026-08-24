import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendWhatsAppButtonMessage } from "@/lib/whatsapp"

export async function GET(request: Request) {
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
      return NextResponse.json({ orders: [] })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get("status")
    const searchQuery = searchParams.get("search")

    const whereClause: any = {
      commerceId: commerce.id,
    }

    if (statusFilter && statusFilter !== "ALL") {
      whereClause.status = statusFilter
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.trim()
      whereClause.OR = [
        { orderNumber: { contains: query, mode: "insensitive" } },
        { recipientName: { contains: query, mode: "insensitive" } },
        { recipientPhone: { contains: query, mode: "insensitive" } },
        { deliveryAddress: { contains: query, mode: "insensitive" } },
      ]
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        driver: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            vehicleType: true,
          },
        },
        rating: {
          select: {
            rating: true,
            comment: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ orders, commerceId: commerce.id })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Error al obtener los pedidos" }, { status: 500 })
  }
}

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
      const slug = `commerce-${session.user.id.slice(0, 8)}-${Date.now().toString().slice(-4)}`
      commerce = await prisma.commerce.create({
        data: {
          userId: session.user.id,
          name: session.user.name || "Mi Negocio",
          slug,
          credits: 10,
        },
      })
    }

    // Check credits
    if (commerce.credits < 1) {
      return NextResponse.json(
        { error: "Créditos insuficientes. Debes recargar créditos para solicitar un domicilio." },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      recipientName,
      recipientPhone,
      branchId,
      pickupAddress,
      pickupNotes,
      pickupLat,
      pickupLng,
      deliveryAddress,
      deliveryNotes,
      deliveryLat,
      deliveryLng,
      packageDescription,
      totalFee,
      distanceKm,
      assignmentType = "DIRECT",
      driverId,
    } = body

    if (!recipientName || !recipientPhone || !pickupAddress || !deliveryAddress || !totalFee) {
      return NextResponse.json(
        { error: "Por favor completa todos los campos obligatorios del pedido" },
        { status: 400 }
      )
    }

    const numericFee = Number(totalFee) || 0
    if (numericFee <= 0) {
      return NextResponse.json({ error: "La tarifa debe ser mayor a 0" }, { status: 400 })
    }

    // Generate Order Number
    const count = await prisma.order.count()
    const orderNumber = `ORD-${String(count + 1).padStart(4, "0")}`

    const initialStatus =
      assignmentType === "DIRECT" && driverId
        ? "ASSIGNING_DIRECT"
        : assignmentType === "BROADCAST"
        ? "ASSIGNING_BROADCAST"
        : "PENDING"

    // Deduct 1 credit and create order in a transaction
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          orderNumber,
          commerceId: commerce.id,
          branchId: branchId || null,
          driverId: driverId || null,
          pickupAddress,
          pickupLat: pickupLat ? parseFloat(pickupLat) : null,
          pickupLng: pickupLng ? parseFloat(pickupLng) : null,
          pickupNotes: pickupNotes || null,
          deliveryAddress,
          deliveryLat: deliveryLat ? parseFloat(deliveryLat) : null,
          deliveryLng: deliveryLng ? parseFloat(deliveryLng) : null,
          deliveryNotes: deliveryNotes || null,
          recipientName,
          recipientPhone,
          packageDescription: packageDescription || null,
          status: initialStatus as any,
          assignmentType: assignmentType as any,
          baseFee: numericFee,
          totalFee: numericFee,
          distanceKm: distanceKm ? parseFloat(distanceKm) : null,
          statusLogs: {
            create: {
              from: null,
              to: initialStatus as any,
              note: "Pedido creado desde el panel del comercio",
              actorId: session.user.id,
            },
          },
        },
        include: {
          driver: true,
          commerce: true,
        },
      }),

      // Deduct credit
      prisma.commerce.update({
        where: { id: commerce.id },
        data: {
          credits: { decrement: 1 },
        },
      }),

      // Record credit transaction
      prisma.transaction.create({
        data: {
          commerceId: commerce.id,
          type: "CONSUMPTION",
          credits: -1,
          balance: commerce.credits - 1,
          description: `Consumo por creación del pedido #${orderNumber}`,
          referenceId: orderNumber,
          createdBy: session.user.id,
        },
      }),
    ])

    // Send WhatsApp notification if direct driver assignment is selected
    if (driverId && initialStatus === "ASSIGNING_DIRECT") {
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
      })
      if (driver?.phone) {
        const deliveryMapLink = deliveryLat && deliveryLng
          ? `\n🗺️ Ubicación: https://www.google.com/maps?q=${deliveryLat},${deliveryLng}`
          : ""
        sendWhatsAppButtonMessage(
          driver.phone,
          `¡Nuevo pedido #${orderNumber} de ${commerce.name}!\n\n📍 Recogida: ${pickupAddress}\n🏠 Entrega: ${deliveryAddress}${deliveryMapLink}\n💰 Tarifa: $${numericFee.toLocaleString("es-CO")}${distanceKm ? `\n📏 Distancia: ${Number(distanceKm).toFixed(1)} km` : ""}`,
          [
            { id: `accept_${order.id}`, title: "Aceptar Pedido" },
            { id: `decline_${order.id}`, title: "Rechazar" },
          ]
        ).catch((e) => console.error("WhatsApp notification error:", e))
      }
    }

    return NextResponse.json({ message: "Pedido creado correctamente", order }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: error.message || "Error interno al crear el pedido" },
      { status: 500 }
    )
  }
}
