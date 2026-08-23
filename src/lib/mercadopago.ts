import { prisma } from "@/lib/prisma"

export async function getMercadoPagoConfig() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "global_settings" },
    })

    const globalSettings = (config?.value as any) || {}
    const mpSettings = globalSettings.payments?.mercadopago || {}

    const accessToken = mpSettings.accessToken?.trim() || process.env.MERCADOPAGO_ACCESS_TOKEN || ""
    const publicKey = mpSettings.publicKey?.trim() || process.env.MERCADOPAGO_PUBLIC_KEY || ""
    const webhookSecret = mpSettings.webhookSecret?.trim() || process.env.MERCADOPAGO_WEBHOOK_SECRET || ""
    const enabled = mpSettings.enabled ?? true

    return {
      enabled,
      accessToken,
      publicKey,
      webhookSecret,
    }
  } catch (error) {
    console.error("Error fetching Mercado Pago DB config:", error)
    return {
      enabled: true,
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || "",
      webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || "",
    }
  }
}

interface PreferenceItem {
  id: string
  title: string
  description?: string
  quantity: number
  currency_id: string
  unit_price: number
}

interface CreatePreferenceInput {
  items: PreferenceItem[]
  payer: {
    name?: string
    email?: string
  }
  external_reference: string
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  notification_url: string
  accessToken?: string
}

export async function createMercadoPagoPreference(input: CreatePreferenceInput) {
  let token = input.accessToken
  if (!token) {
    const config = await getMercadoPagoConfig()
    token = config.accessToken
  }

  if (!token) {
    throw new Error("El Access Token de Mercado Pago no está configurado en la base de datos ni en el entorno")
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: input.items,
      payer: input.payer,
      external_reference: input.external_reference,
      back_urls: input.back_urls,
      auto_return: "approved",
      notification_url: input.notification_url,
      statement_descriptor: "PRONTY CREDITOS",
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Error al crear la preferencia en Mercado Pago")
  }

  return {
    id: data.id,
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
  }
}

export async function getMercadoPagoPayment(paymentId: string, customToken?: string) {
  let token = customToken
  if (!token) {
    const config = await getMercadoPagoConfig()
    token = config.accessToken
  }

  if (!token) {
    throw new Error("El Access Token de Mercado Pago no está configurado")
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Error al consultar el pago ${paymentId} en Mercado Pago`)
  }

  return await response.json()
}
