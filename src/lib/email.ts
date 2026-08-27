import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailProps {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Pronty <[EMAIL_ADDRESS]>",
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export function getResetPasswordEmail(resetLink: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Pronty</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Delivery Profesional</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 30px;">
          <h2 style="margin: 0 0 16px; font-size: 20px; color: #1e293b;">Restablecer contraseña</h2>
          <p style="margin: 0 0 24px; color: #64748b; font-size: 15px;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña.
          </p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Restablecer contraseña
            </a>
          </div>
          
          <p style="margin: 24px 0 0; color: #94a3b8; font-size: 13px; text-align: center;">
            Este enlace expira en 24 horas. Si no solicitaste este cambio, puedes ignorar este mensaje.
          </p>
        </div>
        
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">
          © ${new Date().getFullYear()} Pronty. Todos los derechos reservados.
        </p>
      </body>
    </html>
  `
}

export function getDriverActivationEmail(driverName: string, whatsappLink: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Pronty</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Delivery Profesional</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 30px;">
          <h2 style="margin: 0 0 16px; font-size: 20px; color: #1e293b;">¡Hola ${driverName}! 👋</h2>
          <p style="margin: 0 0 24px; color: #64748b; font-size: 15px;">
            Tu cuenta de domiciliario ha sido aprobada. Para empezar a recibir pedidos, necesitas activar tu cuenta haciendo clic en el botón de abajo.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${whatsappLink}" style="display: inline-block; background: #25d366; color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Activar mi cuenta
            </a>
          </div>
          
          <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-align: center;">
            Esto abrirá WhatsApp con un mensaje predefinido. Solo envíalo para activar tu cuenta.
          </p>
        </div>
        
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">
          © ${new Date().getFullYear()} Pronty. Todos los derechos reservados.
        </p>
      </body>
    </html>
  `
}

interface DeliveryEmailProps {
  driverName: string
  orderNumber: string
  baseFee: number
  commission: number
  netEarning: number
  pickupAddress: string
  deliveryAddress: string
  deliveredAt: Date
}

export function getDeliveryConfirmationEmail({
  driverName,
  orderNumber,
  baseFee,
  commission,
  netEarning,
  pickupAddress,
  deliveryAddress,
  deliveredAt,
}: DeliveryEmailProps) {
  const formattedDate = deliveredAt.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const formattedTime = deliveredAt.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Pronty</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Delivery Profesional</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 30px;">
          <h2 style="margin: 0 0 16px; font-size: 20px; color: #1e293b;">¡Pedido #${orderNumber} entregado! ✅</h2>
          
          <p style="margin: 0 0 24px; color: #64748b; font-size: 15px;">
            Hola ${driverName}, tu entrega ha sido registrada exitosamente.
          </p>

          <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 16px; font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">Resumen del pedido</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 40%;">Pedido</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">#${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Fecha</td>
                <td style="padding: 8px 0; color: #1e293b;">${formattedDate} • ${formattedTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Recogida</td>
                <td style="padding: 8px 0; color: #1e293b;">${pickupAddress}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Entrega</td>
                <td style="padding: 8px 0; color: #1e293b;">${deliveryAddress}</td>
              </tr>
            </table>
          </div>

          <div style="background: white; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 16px; font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">Tu ganancia</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Tarifa base</td>
                <td style="padding: 8px 0; color: #1e293b; text-align: right;">$${baseFee.toLocaleString("es-CO")}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Comisión (20%)</td>
                <td style="padding: 8px 0; color: #ef4444; text-align: right;">-$${commission.toLocaleString("es-CO")}</td>
              </tr>
              <tr style="border-top: 2px solid #e2e8f0;">
                <td style="padding: 12px 0 0; color: #1e293b; font-weight: 700; font-size: 16px;">Ganancia neta</td>
                <td style="padding: 12px 0 0; color: #16a34a; font-weight: 700; font-size: 16px; text-align: right;">$${netEarning.toLocaleString("es-CO")}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin-top: 24px; text-align: center;">
            <p style="margin: 0; color: #16a34a; font-size: 14px; font-weight: 500;">
              Tu ganancia será visible en tu dashboard próximamente.
            </p>
          </div>
        </div>
        
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">
          © ${new Date().getFullYear()} Pronty. Todos los derechos reservados.
        </p>
      </body>
    </html>
  `
}
