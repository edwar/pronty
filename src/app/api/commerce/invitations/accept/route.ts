import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 400 })
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { commerce: true },
    })

    if (!invitation || invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "La invitación no es válida o ya fue procesada" },
        { status: 400 }
      )
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json({ error: "La invitación ha expirado" }, { status: 400 })
    }

    // Link user to commerce and update invitation status
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          role: "COMMERCER",
          commerceId: invitation.commerceId,
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: "ACCEPTED",
        },
      }),
    ])

    return NextResponse.json({
      message: `Te has unido exitosamente a ${invitation.commerce.name}`,
      commerce: invitation.commerce,
    })
  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json(
      { error: "Error interno al aceptar la invitación" },
      { status: 500 }
    )
  }
}
