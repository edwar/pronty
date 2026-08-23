import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token y contraseña son requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    await prisma.user.updateMany({
      where: {
        emailVerified: false,
      },
      data: {
        emailVerified: true,
      },
    })

    return NextResponse.json(
      { message: "Contraseña actualizada correctamente" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Error al restablecer la contraseña" },
      { status: 500 }
    )
  }
}
