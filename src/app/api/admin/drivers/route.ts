import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ drivers })
  } catch (error) {
    console.error("Error fetching drivers:", error)
    return NextResponse.json(
      { error: "Error al obtener los domiciliarios" },
      { status: 500 }
    )
  }
}
