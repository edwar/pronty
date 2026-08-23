import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const drivers = await prisma.driver.findMany({
      where: {
        isApproved: true,
        isAvailable: true,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        vehicleType: true,
        zone: true,
      },
      orderBy: { fullName: "asc" },
    })

    return NextResponse.json({ drivers })
  } catch (error) {
    console.error("Error fetching active drivers:", error)
    return NextResponse.json({ error: "Error al obtener domiciliarios" }, { status: 500 })
  }
}
