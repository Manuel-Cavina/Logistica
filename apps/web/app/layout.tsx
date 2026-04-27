import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3, Lora, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/features/auth/providers/auth-provider";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const loraFont = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const dmSansFont = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ruta Directa — Marketplace de transporte equino",
  description: "Encontrá transportistas verificados, reservá cupos con pago protegido y movéte con respaldo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${headingFont.variable} ${bodyFont.variable} ${loraFont.variable} ${dmSansFont.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
