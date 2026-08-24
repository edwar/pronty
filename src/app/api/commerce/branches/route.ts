import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const commerce = await prisma.commerce.findUnique({
      where: { userId: session.user.id },
    })

    if (!commerce) {
      return NextResponse.json({ error: "Comercio no encontrado" }, { status: 404 })
    }

    const branches = await prisma.branch.findMany({
      where: { commerceId: commerce.id },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    })

    return NextResponse.json({ branches })
  } catch (error) {
    console.error("Error fetching branches:", error)
    return NextResponse.json({ error: "Error al obtener sucursales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const commerce = await prisma.commerce.findUnique({
      where: { userId: session.user.id },
    })

    if (!commerce) {
      return NextResponse.json({ error: "Comercio no encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const { name, address, phone, city, lat, lng, isDefault } = body

    if (!name || !address) {
      return NextResponse.json(
        { error: "Nombre y dirección son obligatorios" },
        { status: 400 }
      )
    }

    // Si es la primera sucursal o se marca como default, desmarcar las demás
    if (isDefault) {
      await prisma.branch.updateMany({
        where: { commerceId: commerce.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const branch = await prisma.branch.create({
      data: {
        commerceId: commerce.id,
        name,
        address,
        phone: phone || null,
        city: city || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json({ branch }, { status: 201 })
  } catch (error) {
    console.error("Error creating branch:", error)
    return NextResponse.json({ error: "Error al crear sucursal" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const commerce = await prisma.commerce.findUnique({
      where: { userId: session.user.id },
    })

    if (!commerce) {
      return NextResponse.json({ error: "Comercio no encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const { id, name, address, phone, city, lat, lng, isDefault, isActive } = body

    if (!id) {
      return NextResponse.json({ error: "ID de sucursal requerido" }, { status: 400 })
    }

    // Verificar que la sucursal pertenece al comercio
    const existingBranch = await prisma.branch.findFirst({
      where: { id, commerceId: commerce.id },
    })

    if (!existingBranch) {
      return NextResponse.json({ error: "Sucursal no encontrada" }, { status: 404 })
    }

    // Si se marca como default, desmarcar las demás
    if (isDefault && !existingBranch.isDefault) {
      await prisma.branch.updateMany({
        where: { commerceId: commerce.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        name: name || undefined,
        address: address || undefined,
        phone: phone !== undefined ? phone : undefined,
        city: city !== undefined ? city : undefined,
        lat: lat !== undefined ? (lat ? parseFloat(lat) : null) : undefined,
        lng: lng !== undefined ? (lng ? parseFloat(lng) : null) : undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    })

    return NextResponse.json({ branch })
  } catch (error) {
    console.error("Error updating branch:", error)
    return NextResponse.json({ error: "Error al actualizar sucursal" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const commerce = await prisma.commerce.findUnique({
      where: { userId: session.user.id },
    })

    if (!commerce) {
      return NextResponse.json({ error: "Comercio no encontrado" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID de sucursal requerido" }, { status: 400 })
    }

    // Verificar que la sucursal pertenece al comercio
    const existingBranch = await prisma.branch.findFirst({
      where: { id, commerceId: commerce.id },
    })

    if (!existingBranch) {
      return NextResponse.json({ error: "Sucursal no encontrada" }, { status: 404 })
    }

    // No permitir eliminar si es la única sucursal activa
    const activeBranchCount = await prisma.branch.count({
      where: { commerceId: commerce.id, isActive: true },
    })

    if (activeBranchCount <= 1 && existingBranch.isActive) {
      return NextResponse.json(
        { error: "No puedes eliminar la única sucursal activa" },
        { status: 400 }
      )
    }

    await prisma.branch.delete({ where: { id } })

    return NextResponse.json({ message: "Sucursal eliminada" })
  } catch (error) {
    console.error("Error deleting branch:", error)
    return NextResponse.json({ error: "Error al eliminar sucursal" }, { status: 500 })
  }
}
