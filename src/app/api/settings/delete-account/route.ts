import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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
    const { confirmEmail } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.email !== confirmEmail) {
      return NextResponse.json(
        { error: "El email no coincide" },
        { status: 400 }
      )
    }

    if (session.user.role === "ADMIN_MASTER") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN_MASTER" },
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "No puedes eliminar la cuenta del único administrador" },
          { status: 400 }
        )
      }
    }

    await prisma.session.deleteMany({
      where: { userId: session.user.id },
    })

    await prisma.account.deleteMany({
      where: { userId: session.user.id },
    })

    if (session.user.role === "COMMERCER") {
      const commerce = await prisma.commerce.findUnique({
        where: { userId: session.user.id },
      })

      if (commerce) {
        await prisma.order.deleteMany({
          where: { commerceId: commerce.id },
        })

        await prisma.transaction.deleteMany({
          where: { commerceId: commerce.id },
        })

        await prisma.creditPackage.deleteMany({
          where: { commerceId: commerce.id },
        })

        await prisma.commerce.delete({
          where: { id: commerce.id },
        })
      }
    }

    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({ message: "Cuenta eliminada correctamente" })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json(
      { error: "Error al eliminar la cuenta" },
      { status: 500 }
    )
  }
}
