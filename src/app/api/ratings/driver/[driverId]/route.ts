import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params

    const ratings = await prisma.rating.findMany({
      where: { driverId },
      include: {
        commerce: {
          select: {
            name: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            deliveryAddress: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const stats = await prisma.rating.aggregate({
      where: { driverId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    })

    return NextResponse.json({
      ratings,
      stats: {
        average: stats._avg.rating ?? 0,
        total: stats._count.rating,
      },
    })
  } catch (error) {
    console.error("Error fetching ratings:", error)
    return NextResponse.json(
      { error: "Error al obtener las calificaciones" },
      { status: 500 }
    )
  }
}
