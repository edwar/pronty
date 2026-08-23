import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
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

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Contraseña actual y nueva contraseña son requeridas" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
      },
      headers: request.headers,
    })

    return NextResponse.json({ message: "Contraseña actualizada correctamente" })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta." },
      { status: 500 }
    )
  }
}
