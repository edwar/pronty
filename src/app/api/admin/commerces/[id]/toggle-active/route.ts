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

    const commerce = await prisma.commerce.findUnique({
      where: { id },
    })

    if (!commerce) {
      return NextResponse.json(
        { error: "Comercio no encontrado" },
        { status: 404 }
      )
    }

    await prisma.commerce.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json({
      message: isActive
        ? "Comercio activado correctamente"
        : "Comercio desactivado correctamente",
    })
  } catch (error) {
    console.error("Error toggling commerce:", error)
    return NextResponse.json(
      { error: "Error al cambiar el estado del comercio" },
      { status: 500 }
    )
  }
}
