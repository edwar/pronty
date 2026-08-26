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
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pronty — Sistema Profesional de Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pronty — Delivery Profesional para Negocios Locales",
    description:
      "Gestiona pedidos, domiciliarios y pagos desde un solo panel. Todo por WhatsApp.",
    images: ["/og-image.png"],
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
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
  return (
    <html lang="es" className={`${dmSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased">
        <TooltipProvider delay={0}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
