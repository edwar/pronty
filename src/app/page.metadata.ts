import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pronty.app";

export const metadata: Metadata = {
  title: "Pronty — Delivery Profesional para Negocios Locales",
  description:
    "Sistema profesional de delivery que reemplaza los grupos de WhatsApp. Gestiona pedidos, domiciliarios y pagos desde un solo panel. Sin app para repartidores — todo por WhatsApp.",
  openGraph: {
    title: "Pronty — Delivery Profesional para Negocios Locales",
    description:
      "Gestiona pedidos, domiciliarios y pagos desde un solo panel. Sin app para repartidores — todo por WhatsApp.",
    url: siteUrl,
    siteName: "Pronty",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pronty — Sistema Profesional de Delivery",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pronty — Delivery Profesional para Negocios Locales",
    description:
      "Gestiona pedidos, domiciliarios y pagos desde un solo panel. Todo por WhatsApp.",
    images: ["/og-image.png"],
  },
};
