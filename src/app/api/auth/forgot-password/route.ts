import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, getResetPasswordEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "El email es requerido" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    const message = "Si el email existe, recibirás un enlace de recuperación"

    if (!user) {
      return NextResponse.json({ message }, { status: 200 })
    }

    const resetToken = crypto.randomUUID()
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    console.log("═".repeat(50))
    console.log("🔗 LINK DE RECUPERACIÓN (desarrollo):")
    console.log(resetLink)
    console.log("═".repeat(50))

    const emailResult = await sendEmail({
      to: email,
      subject: "Restablecer contraseña - Pronty",
      html: getResetPasswordEmail(resetLink),
    })

    if (!emailResult.success) {
      console.log("⚠️  No se pudo enviar el email. Usa el link de arriba.")
    }

    return NextResponse.json({ message }, { status: 200 })
  } catch (error) {
    console.error("Error in forgot password:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
