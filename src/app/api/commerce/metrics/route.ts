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

    let commerce = await prisma.commerce.findUnique({
      where: { userId: session.user.id },
    })

    if (!commerce && (session.user as any).commerceId) {
      commerce = await prisma.commerce.findUnique({
        where: { id: (session.user as any).commerceId },
      })
    }

    if (!commerce) {
      return NextResponse.json(
        { error: "Comercio no encontrado" },
        { status: 404 }
      )
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      monthRevenue,
      ratings,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { commerceId: commerce.id },
      }),
      prisma.order.count({
        where: {
          commerceId: commerce.id,
          createdAt: { gte: todayStart },
        },
      }),
      prisma.order.count({
        where: {
          commerceId: commerce.id,
          createdAt: { gte: weekStart },
        },
      }),
      prisma.order.count({
        where: {
          commerceId: commerce.id,
          createdAt: { gte: monthStart },
        },
      }),
      prisma.order.count({
        where: {
          commerceId: commerce.id,
          status: "DELIVERED",
        },
      }),
      prisma.order.count({
        where: {
          commerceId: commerce.id,
          status: "CANCELLED",
        },
      }),
      prisma.order.aggregate({
        where: {
          commerceId: commerce.id,
          status: "DELIVERED",
        },
        _sum: { totalFee: true },
      }),
      prisma.order.aggregate({
        where: {
          commerceId: commerce.id,
          status: "DELIVERED",
          createdAt: { gte: monthStart },
        },
        _sum: { totalFee: true },
      }),
      prisma.rating.aggregate({
        where: { commerceId: commerce.id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.order.findMany({
        where: { commerceId: commerce.id },
        include: {
          driver: {
            select: { fullName: true },
          },
          rating: {
            select: { rating: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ])

    const days = 14
    const series: { date: string; label: string; orders: number; revenue: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const next = new Date(d)
      next.setDate(d.getDate() + 1)

      const dayOrders = await prisma.order.count({
        where: {
          commerceId: commerce.id,
          createdAt: { gte: d, lt: next },
        },
      })

      const dayRevenue = await prisma.order.aggregate({
        where: {
          commerceId: commerce.id,
          status: "DELIVERED",
          createdAt: { gte: d, lt: next },
        },
        _sum: { totalFee: true },
      })

      series.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
        orders: dayOrders,
        revenue: Number(dayRevenue._sum.totalFee ?? 0),
      })
    }

    return NextResponse.json({
      summary: {
        totalOrders,
        todayOrders,
        weekOrders,
        monthOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: Number(totalRevenue._sum.totalFee ?? 0),
        monthRevenue: Number(monthRevenue._sum.totalFee ?? 0),
        averageRating: ratings._avg.rating ?? 0,
        totalRatings: ratings._count.rating,
        credits: commerce.credits,
      },
      series,
      recentOrders,
    })
  } catch (error) {
    console.error("Error fetching commerce metrics:", error)
    return NextResponse.json(
      { error: "Error al obtener las métricas" },
      { status: 500 }
    )
  }
}
