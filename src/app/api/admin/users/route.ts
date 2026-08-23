import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        commerce: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            isApproved: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Error al obtener los usuarios" },
      { status: 500 }
    )
  }
}
