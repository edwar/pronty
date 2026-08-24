import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Contacto - Pronty",
  description: "Contáctanos para soporte o información",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-6">Contacto</h1>
        <p className="text-muted-foreground mb-8">
          ¿Tienes preguntas o necesitas ayuda? Estamos aquí para ti.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground">soporte@pronty.app</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Envíanos un correo y te responderemos en menos de 24 horas.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Teléfono</h3>
                <p className="text-sm text-muted-foreground">+57 317 522 7672</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Lunes a viernes de 8:00 a.m. a 6:00 p.m.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">WhatsApp</h3>
                <p className="text-sm text-muted-foreground">+57 317 522 7672</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Escríbenos por WhatsApp para atención inmediata.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Ubicación</h3>
                <p className="text-sm text-muted-foreground">Tunja, Colombia</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Operamos en Tunja y alrededores.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-lg border border-border/60 p-6">
          <h2 className="text-xl font-semibold mb-4">Envíanos un mensaje</h2>
          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="text-sm font-medium">Asunto</label>
              <input
                type="text"
                id="subject"
                className="mt-1 w-full rounded-lg border border-border/60 bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="¿Cómo podemos ayudarte?"
              />
            </div>
            <div>
              <label htmlFor="message" className="text-sm font-medium">Mensaje</label>
              <textarea
                id="message"
                rows={4}
                className="mt-1 w-full rounded-lg border border-border/60 bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
