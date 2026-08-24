import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const branches = await prisma.branch.findMany({
      where: {
        commerceId: id,
        isActive: true,
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        city: true,
        lat: true,
        lng: true,
        isDefault: true,
      },
    })

    return NextResponse.json({ branches })
  } catch (error) {
    console.error("Error fetching branches:", error)
    return NextResponse.json({ error: "Error al obtener sucursales" }, { status: 500 })
  }
}
