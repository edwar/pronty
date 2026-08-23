import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const commerces = await prisma.commerce.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            orders: true,
            transactions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ commerces })
  } catch (error) {
    console.error("Error fetching commerces:", error)
    return NextResponse.json(
      { error: "Error al obtener los comercios" },
      { status: 500 }
    )
  }
}
