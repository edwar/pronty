import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [orders, transactions, commerces, drivers, earnings] = await Promise.all([
      prisma.order.findMany({
        select: {
          id: true,
          status: true,
          baseFee: true,
          commissionFee: true,
          totalFee: true,
          createdAt: true,
          commerceId: true,
          driverId: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.transaction.findMany({
        select: {
          id: true,
          type: true,
          credits: true,
          balance: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.commerce.findMany({
        select: { id: true, name: true },
      }),
      prisma.driver.findMany({
        select: { id: true, fullName: true },
      }),
      prisma.driverEarning.findMany({
        select: {
          id: true,
          driverId: true,
          netEarning: true,
          status: true,
          createdAt: true,
        },
      }),
    ])

    const deliveredOrders = orders.filter((o: any) => o.status === "DELIVERED")
    const totalRevenue = deliveredOrders.reduce(
      (sum: number, o: any) => sum + Number(o.totalFee),
      0
    )
    const totalCommissions = deliveredOrders.reduce(
      (sum: number, o: any) => sum + Number(o.commissionFee ?? 0),
      0
    )
    const creditsSold = transactions
      .filter((t: any) => t.type === "PURCHASE")
      .reduce((sum: number, t: any) => sum + t.credits, 0)
    const pendingPayouts = earnings
      .filter((e: any) => e.status === "PENDING")
      .reduce((sum: number, e: any) => sum + Number(e.netEarning), 0)

    const days = 30
    const now = new Date()
    const series: { date: string; label: string; orders: number; revenue: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const next = new Date(d)
      next.setDate(d.getDate() + 1)
      const dayOrders = deliveredOrders.filter(
        (o: any) => new Date(o.createdAt) >= d && new Date(o.createdAt) < next
      )
      series.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum: number, o: any) => sum + Number(o.totalFee), 0),
      })
    }

    const commerceMap = new Map(commerces.map((c: any) => [c.id, c.name]))
    const ordersByCommerce = new Map<string, { orders: number; revenue: number }>()
    for (const o of deliveredOrders) {
      const current = ordersByCommerce.get(o.commerceId) ?? { orders: 0, revenue: 0 }
      current.orders += 1
      current.revenue += Number(o.totalFee)
      ordersByCommerce.set(o.commerceId, current)
    }
    const topCommerces = [...ordersByCommerce.entries()]
      .map(([id, stats]) => ({
        id,
        name: commerceMap.get(id) ?? "Desconocido",
        ...stats,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const driverMap = new Map(drivers.map((d: any) => [d.id, d.fullName]))
    const ordersByDriver = new Map<string, { orders: number; earnings: number }>()
    for (const o of deliveredOrders) {
      if (!o.driverId) continue
      const current = ordersByDriver.get(o.driverId) ?? { orders: 0, earnings: 0 }
      current.orders += 1
      ordersByDriver.set(o.driverId, current)
    }
    for (const e of earnings) {
      const current = ordersByDriver.get(e.driverId) ?? { orders: 0, earnings: 0 }
      current.earnings += Number(e.netEarning)
      ordersByDriver.set(e.driverId, current)
    }
    const topDrivers = [...ordersByDriver.entries()]
      .map(([id, stats]) => ({
        id,
        name: driverMap.get(id) ?? "Desconocido",
        ...stats,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)

    return NextResponse.json({
      summary: {
        totalOrders: deliveredOrders.length,
        totalRevenue,
        totalCommissions,
        creditsSold,
        pendingPayouts,
        activeCommerces: commerces.length,
        activeDrivers: drivers.length,
      },
      series,
      topCommerces,
      topDrivers,
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Error al generar los reportes" },
      { status: 500 }
    )
  }
}
