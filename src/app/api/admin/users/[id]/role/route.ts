import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const VALID_ROLES = ["ADMIN_MASTER", "COMMERCER", "DRIVER", "PERSON"]

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { role } = body

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Rol inválido" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    if (user.role === "ADMIN_MASTER" && role !== "ADMIN_MASTER") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN_MASTER" },
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "No puedes quitar el rol del único administrador" },
          { status: 400 }
        )
      }
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    })

    return NextResponse.json({ message: "Rol actualizado correctamente" })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      { error: "Error al actualizar el rol" },
      { status: 500 }
    )
  }
}
