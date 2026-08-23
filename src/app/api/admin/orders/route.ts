import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        commerce: {
          select: {
            id: true,
            name: true,
          },
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Error al obtener los pedidos" },
      { status: 500 }
    )
  }
}
