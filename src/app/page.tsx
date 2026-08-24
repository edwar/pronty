"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { 
  ArrowRight,
  Package,
  MapPin,
  Clock,
  Wallet,
  Shield,
  BarChart3,
  Smartphone,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react"

const stats = [
  { value: "500+", label: "Negocios activos" },
  { value: "15k+", label: "Pedidos procesados" },
  { value: "4.8", label: "Calificación promedio" },
]

const features = [
  {
    icon: Smartphone,
    title: "Sin Apps para Domiciliarios",
    description: "Tus repartidores operan 100% por WhatsApp. Sin instalar nada.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: MapPin,
    title: "Trazabilidad Total",
    description: "Cada estado registrado, cada entrega visible para ti y tus clientes.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Wallet,
    title: "Créditos Flexibles",
    description: "Paga por uso. Sin suscripciones fijas, sin sorpresas.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Clock,
    title: "Asignación Inteligente",
    description: "Asigna directamente o usa broadcast. El sistema prioriza automáticamente.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Shield,
    title: "Multi-usuario",
    description: "Dueño configura, empleados operan. Control total del negocio.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: BarChart3,
    title: "Métricas en Tiempo Real",
    description: "Dashboard con pedidos, domiciliarios activos e historial completo.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
]

const steps = [
  {
    number: "01",
    title: "Registra tu Negocio",
    description: "Crea tu cuenta y configura tu restaurante o negocio en minutos.",
  },
  {
    number: "02",
    title: "Carga Pedidos",
    description: "Crea pedidos desde tu panel y asígnalos a domiciliarios en un clic.",
  },
  {
    number: "03",
    title: "Entrega Rápida",
    description: "Tus domiciliarios reciben todo por WhatsApp y entregan en minutos.",
  },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/">
            <Logo className="h-9 w-9" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Iniciar Sesión
            </Link>
            <Button size="sm">
              <Link href="/drivers/register">Ser Domiciliario</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero - Asymmetric Layout */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-background to-violet-50/30" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-[10%] h-64 w-64 rounded-full bg-blue-100/50 blur-[80px]" />
        <div className="absolute bottom-20 left-[5%] h-64 w-64 rounded-full bg-violet-100/50 blur-[80px]" />

        <div className="container relative mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left - Content */}
            <div className="max-w-xl">
              <div className="mb-8 flex items-center gap-3">
                <span className="h-px w-8 bg-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Delivery para negocios
                </p>
              </div>
              
              <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Tu negocio,
                <br />
                <span className="text-primary">
                  tus reglas
                </span>
              </h1>
              
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                Gestiona pedidos, domiciliarios y créditos desde un solo panel.
                Tus repartidores operan por WhatsApp sin necesidad de apps.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="px-8">
                  <Link href="/register" className="flex items-center">
                    Comenzar Gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8">
                  <Link href="/drivers/register" className="flex items-center">
                    Ser Domiciliario
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                {["Sin tarifas fijas", "Paga por uso", "Setup en 5 min"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Dashboard Preview */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-100 to-violet-100 blur-2xl opacity-60" />
              <div className="relative rounded-2xl border border-border/60 bg-card p-1 shadow-2xl shadow-primary/5">
                <div className="rounded-xl border border-border/40 bg-background p-6">
                  {/* Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Buenos días, Juan 👋</p>
                      <p className="text-xs text-muted-foreground">Resumen de tu negocio hoy</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                      3 activos
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { icon: Package, label: "Pedidos", value: "24", color: "text-primary", bg: "bg-primary/10" },
                      { icon: TrendingUp, label: "Entregados", value: "18", color: "text-success", bg: "bg-success/10" },
                      { icon: Clock, label: "En tránsito", value: "6", color: "text-warning", bg: "bg-warning/10" },
                      { icon: Wallet, label: "Créditos", value: "156", color: "text-primary", bg: "bg-primary/10" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-border/60 bg-card p-3">
                        <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-xl font-semibold">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Orders List */}
                  <div className="rounded-xl border border-border/60 bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium">Pedidos recientes</p>
                      <Link href="/orders" className="flex items-center text-xs text-primary hover:text-primary/80">
                        Ver todos
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: "ORD-284", status: "Entregado", time: "Hace 12 min", color: "text-success", dot: "bg-success" },
                        { id: "ORD-283", status: "En tránsito", time: "Hace 18 min", color: "text-primary", dot: "bg-primary" },
                        { id: "ORD-282", status: "Entregado", time: "Hace 25 min", color: "text-success", dot: "bg-success" },
                      ].map((order) => (
                        <div key={order.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-background px-3 py-2.5">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{order.id}</span>
                            <span className={`flex items-center gap-1.5 text-xs font-medium ${order.color}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${order.dot}`} />
                              {order.status}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{order.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Funcionalidades</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas
            </h2>
            <p className="text-muted-foreground">
              Herramientas profesionales para negocios locales que quieren competir con las grandes plataformas.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className={cn(
                  "group rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-border",
                  mounted && "animate-fade-in-up"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-y border-border/60 bg-muted/30 px-6 py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Proceso
              </p>
              <span className="h-px w-8 bg-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Cómo funciona
            </h2>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connector line - desktop only */}
            <div className="absolute left-0 right-0 top-10 hidden h-px bg-border md:block" />
            
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border/60 bg-background text-2xl font-bold text-primary shadow-sm">
                    {step.number}
                  </div>
                  <h3 className="mb-2 font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-blue-50 via-background to-violet-50 p-12 text-center sm:p-16">
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-100 blur-[80px]" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-violet-100 blur-[80px]" />
            
            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                ¿Listo para profesionalizar tu delivery?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Únete a los negocios que ya usan Pronty para competir con las grandes plataformas.
              </p>
              <Button size="lg" className="px-10">
                <Link href="/register" className="flex items-center">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 px-6 py-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo className="h-7 w-7" />
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Términos
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Privacidad
            </Link>
            <Link href="/contacto" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Contacto
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 Pronty
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}
