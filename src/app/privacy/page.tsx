import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Política de Privacidad - Pronty",
  description: "Política de privacidad y protección de datos de Pronty",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-6">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground mb-8">Última actualización: 24 de agosto de 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Información que Recopilamos</h2>
            <p className="text-muted-foreground">
              Recopilamos información que usted nos proporciona directamente al registrarse, como nombre, correo electrónico, número de teléfono y información del negocio. También recopilamos datos de uso de la plataforma y información de dispositivos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Uso de la Información</h2>
            <p className="text-muted-foreground">
              Utilizamos su información para: proporcionar y mejorar nuestros servicios, procesar transacciones, enviar notificaciones relacionadas con pedidos, comunicarnos con usted sobre actualizaciones y ofertas, y garantizar la seguridad de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Compartir Información</h2>
            <p className="text-muted-foreground">
              Compartimos su información solo cuando es necesario para proporcionar el servicio: con domiciliarios para completar entregas, con procesadores de pago para transacciones, y cuando lo requiera la ley. No vendemos su información a terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Seguridad de los Datos</h2>
            <p className="text-muted-foreground">
              Implementamos medidas de seguridad técnicas y organizativas para proteger su información contra acceso no autorizado, alteración, divulgación o destrucción. Utilizamos encriptación SSL/TLS para todas las transmisiones de datos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Retención de Datos</h2>
            <p className="text-muted-foreground">
              Conservamos su información personal mientras su cuenta esté activa o según sea necesario para proporcionar servicios. Puede solicitar la eliminación de su cuenta y datos personales en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Sus Derechos</h2>
            <p className="text-muted-foreground">
              Usted tiene derecho a: acceder a sus datos personales, corregir información inexacta, solicitar la eliminación de sus datos, oponerse al procesamiento de sus datos, y solicitar la portabilidad de sus datos. Para ejercer estos derechos, contáctenos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
            <p className="text-muted-foreground">
              Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el uso de la plataforma y personalizar el contenido. Puede configurar su navegador para rechazar cookies, aunque esto podría afectar la funcionalidad del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Cambios en esta Política</h2>
            <p className="text-muted-foreground">
              Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Los cambios serán publicados en esta página con la fecha de la última actualización. Le recomendamos revisar periódicamente esta política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contacto</h2>
            <p className="text-muted-foreground">
              Si tiene preguntas sobre esta política de privacidad o sobre el tratamiento de sus datos personales, puede contactarnos a través de: soporte@pronty.app
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
