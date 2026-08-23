import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Pronty - Delivery Profesional",
  description: "Sistema profesional de delivery para negocios locales",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${dmSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        <TooltipProvider delay={0}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
