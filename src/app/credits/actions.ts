"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function getCommerceCreditsData() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    throw new Error("No estás autenticado")
  }

  // Assuming user has a commerce linked either directly via commerceId or userId
  // The schema says Commerce has `userId` referencing User
  const commerce = await prisma.commerce.findUnique({
    where: { userId: session.user.id },
  })

  if (!commerce) {
    throw new Error("No se encontró el comercio asociado al usuario")
  }

  const commerceId = commerce.id
  const balance = commerce.credits

  // Get current date boundaries for "este mes"
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Aggregate purchased credits this month
  const purchasedThisMonthAggregation = await prisma.transaction.aggregate({
    where: {
      commerceId,
      type: "PURCHASE",
      createdAt: {
        gte: startOfMonth,
      },
    },
    _sum: {
      credits: true,
    },
  })
  
  const purchasedThisMonth = purchasedThisMonthAggregation._sum.credits || 0

  // Aggregate consumed credits (total or this month, we'll do total or maybe this month too)
  const consumedAggregation = await prisma.transaction.aggregate({
    where: {
      commerceId,
      type: "CONSUMPTION",
    },
    _sum: {
      credits: true,
    },
  })
  // consumed credits are stored as negative or positive? In the mock they are negative. Let's assume negative or positive, we use Math.abs
  const consumedTotal = Math.abs(consumedAggregation._sum.credits || 0)

  // Get last package size
  const lastPurchase = await prisma.transaction.findFirst({
    where: {
      commerceId,
      type: "PURCHASE",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      credits: true,
      description: true,
    }
  })

  const lastPackageSize = lastPurchase ? lastPurchase.credits : 0
  const lastPackageDescription = lastPurchase?.description || "Ninguno"

  // Get transaction history
  const recentTransactions = await prisma.transaction.findMany({
    where: {
      commerceId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  })

  return {
    balance,
    purchasedThisMonth,
    consumedTotal,
    lastPackageSize,
    lastPackageDescription,
    recentTransactions: recentTransactions.map(tx => ({
      ...tx,
      // Ensure we pass plain objects to client
      createdAt: tx.createdAt.toISOString()
    })),
  }
}
