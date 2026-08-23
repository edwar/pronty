import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isActive } = body

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
      data: { isActive },
    })

    return NextResponse.json({
      message: isActive
        ? "Domiciliario activado correctamente"
        : "Domiciliario desactivado correctamente",
    })
  } catch (error) {
    console.error("Error toggling driver:", error)
    return NextResponse.json(
      { error: "Error al cambiar el estado del domiciliario" },
      { status: 500 }
    )
  }
}
