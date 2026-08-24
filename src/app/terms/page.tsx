import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Términos y Condiciones - Pronty",
  description: "Términos y condiciones de uso de la plataforma Pronty",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-6">Términos y Condiciones</h1>
        <p className="text-sm text-muted-foreground mb-8">Última actualización: 24 de agosto de 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
            <p className="text-muted-foreground">
              Al acceder y utilizar Pronty, usted acepta estos términos y condiciones en su totalidad. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestra plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
            <p className="text-muted-foreground">
              Pronty es una plataforma de gestión de domicilios que conecta comercios con domiciliarios independientes. Proporcionamos las herramientas necesarias para crear, asignar y rastrear pedidos de entrega.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Registro y Cuentas</h2>
            <p className="text-muted-foreground">
              Para utilizar Pronty, debe crear una cuenta proporcionando información precisa y completa. Usted es responsable de mantener la confidencialidad de sus credenciales y de todas las actividades que ocurran en su cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Uso Aceptable</h2>
            <p className="text-muted-foreground">
              Usted se compromete a utilizar Pronty únicamente para fines lícitos y de acuerdo con estos términos. Está prohibido utilizar la plataforma para actividades fraudulentas, ilegales o que puedan dañar a otros usuarios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Créditos y Pagos</h2>
            <p className="text-muted-foreground">
              El uso de Pronty requiere créditos que pueden adquirirse a través de la plataforma. Los créditos son personales e intransferibles. Pronty se reserva el derecho de modificar los precios y políticas de créditos con previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Responsabilidades</h2>
            <p className="text-muted-foreground">
              Pronty actúa como intermediario entre comercios y domiciliarios. No somos responsables por la calidad del servicio de entrega, daños a mercancía, o disputas entre las partes. Los domiciliarios son independientes y no son empleados de Pronty.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground">
              En ningún caso Pronty será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten del uso de la plataforma. Nuestra responsabilidad máxima se limitará al monto pagado por el usuario en los últimos 12 meses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Modificaciones</h2>
            <p className="text-muted-foreground">
              Pronty se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones serán efectivas una vez publicadas en esta página. El uso continuado de la plataforma después de los cambios constituye aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contacto</h2>
            <p className="text-muted-foreground">
              Si tiene preguntas sobre estos términos, puede contactarnos a través de nuestro correo electrónico: soporte@pronty.app
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
