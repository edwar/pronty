import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMercadoPagoPayment } from "@/lib/mercadopago"

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const body = await request.json().catch(() => ({}))

    const paymentId =
      body?.data?.id ||
      searchParams.get("id") ||
      searchParams.get("data.id") ||
      (body?.type === "payment" ? body?.id : null)

    if (!paymentId) {
      return NextResponse.json({ received: true, note: "Sin ID de pago para procesar" })
    }

    // Fetch verified payment details from Mercado Pago API
    const payment = await getMercadoPagoPayment(String(paymentId))

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ received: true, status: payment?.status || "not_approved" })
    }

    const externalRef = payment.external_reference || ""
    const parts = externalRef.split("|")
    if (parts.length < 3) {
      console.warn("Mercado Pago webhook: Referencia externa inválida:", externalRef)
      return NextResponse.json({ received: true, note: "Referencia externa inválida" })
    }

    const [commerceId, packageId, creditsStr] = parts
    const addedCredits = parseInt(creditsStr, 10) || 0

    if (!commerceId || addedCredits <= 0) {
      return NextResponse.json({ received: true, note: "Datos de comercio o créditos inválidos" })
    }

    // Check idempotency (prevent double processing)
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        referenceId: String(payment.id),
      },
    })

    if (existingTransaction) {
      return NextResponse.json({ received: true, note: "Pago ya procesado previamente" })
    }

    // Find commerce
    const commerce = await prisma.commerce.findUnique({
      where: { id: commerceId },
    })

    if (!commerce) {
      return NextResponse.json({ received: true, error: "Comercio no encontrado" }, { status: 404 })
    }

    const newBalance = commerce.credits + addedCredits

    // Increment credits & record transaction atomically
    await prisma.$transaction([
      prisma.commerce.update({
        where: { id: commerceId },
        data: { credits: { increment: addedCredits } },
      }),
      prisma.transaction.create({
        data: {
          commerceId,
          type: "RECHARGE",
          credits: addedCredits,
          balance: newBalance,
          description: `Recarga de ${addedCredits} créditos vía Mercado Pago (Pago #${payment.id})`,
          referenceId: String(payment.id),
        },
      }),
    ])

    return NextResponse.json({ received: true, success: true, addedCredits })
  } catch (error: any) {
    console.error("Error processing Mercado Pago webhook:", error)
    return NextResponse.json(
      { error: error.message || "Error procesando webhook de Mercado Pago" },
      { status: 500 }
    )
  }
}

// Allow GET for webhook health checks
export async function GET() {
  return NextResponse.json({ status: "Mercado Pago Webhook Endpoint Active" })
}
