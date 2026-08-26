import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pronty.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pronty — Delivery Profesional para Negocios Locales",
    template: "%s | Pronty",
  },
  description:
    "Sistema profesional de delivery que reemplaza los grupos de WhatsApp. Gestiona pedidos, domiciliarios y pagos desde un solo panel. Sin app para repartidores — todo por WhatsApp.",
  keywords: [
    "delivery",
    "domicilios",
    "WhatsApp",
    "negocios locales",
    "restaurants",
    "pedidos",
    "repartidores",
    "logística",
    "Latinoamérica",
    "Colombia",
  ],
  authors: [{ name: "Pronty" }],
  creator: "Pronty",
  publisher: "Pronty",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteUrl,
    siteName: "Pronty",
    title: "Pronty — Delivery Profesional para Negocios Locales",
    description:
      "Gestiona pedidos, domiciliarios y pagos desde un solo panel. Sin app para repartidores — todo por WhatsApp.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Pronty — Sistema Profesional de Delivery",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pronty — Delivery Profesional para Negocios Locales",
    description:
      "Gestiona pedidos, domiciliarios y pagos desde un solo panel. Todo por WhatsApp.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const faviconSvg = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="14" fill="url(#g)"/><g stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M26 14h4"/><path d="M30 14l4 20"/><path d="M14 34h4l3-5h12"/><circle cx="14" cy="34" r="4"/><circle cx="34" cy="34" r="4"/></g><rect x="9" y="17" width="10" height="9" rx="2.5" fill="#fff"/><defs><linearGradient id="g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse"><stop stop-color="#2563eb"/><stop offset="1" stop-color="#6d28d9"/></linearGradient></defs></svg>`
  const faviconDataUri = `data:image/svg+xml;base64,${Buffer.from(faviconSvg).toString("base64")}`

  return (
    <html lang="es" className={`${dmSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <link rel="icon" href={faviconDataUri} type="image/svg+xml" />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased">
        <TooltipProvider delay={0}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
