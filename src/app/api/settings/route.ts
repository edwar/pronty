import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        commerce: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const orderCount = await prisma.order.count({
      where: {
        commerce: { userId: session.user.id },
      },
    })

    const transactionCount = await prisma.transaction.count({
      where: { commerceId: user.commerce?.id },
    })

    return NextResponse.json({
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      commerce: user.commerce
        ? {
            name: user.commerce.name,
            slug: user.commerce.slug,
            isActive: user.commerce.isActive,
            credits: user.commerce.credits,
            address: user.commerce.address,
            phone: user.commerce.phone,
            whatsapp: user.commerce.whatsapp,
          }
        : null,
      stats: {
        orders: orderCount,
        transactions: transactionCount,
      },
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Error al obtener la configuración" },
      { status: 500 }
    )
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
    const { commerceName, commercePhone, commerceAddress, commerceWhatsapp } = body

    if (session.user.role === "COMMERCER") {
      const existingCommerce = await prisma.commerce.findUnique({
        where: { userId: session.user.id },
      })

      if (existingCommerce) {
        await prisma.commerce.update({
          where: { userId: session.user.id },
          data: {
            name: commerceName || undefined,
            phone: commercePhone || undefined,
            address: commerceAddress || undefined,
            whatsapp: commerceWhatsapp || undefined,
          },
        })
      }
    }

    return NextResponse.json({ message: "Configuración del negocio actualizada" })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Error al actualizar la configuración" },
      { status: 500 }
    )
  }
}
