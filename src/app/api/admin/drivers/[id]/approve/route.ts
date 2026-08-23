import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const driver = await prisma.driver.findUnique({
      where: { id },
    })

    if (!driver) {
      return NextResponse.json(
        { error: "Domiciliario no encontrado" },
        { status: 404 }
      )
    }

    await prisma.driver.update({
      where: { id },
      data: { isApproved: true },
    })

    return NextResponse.json({ message: "Domiciliario aprobado correctamente" })
  } catch (error) {
    console.error("Error approving driver:", error)
    return NextResponse.json(
      { error: "Error al aprobar el domiciliario" },
      { status: 500 }
    )
  }
}
