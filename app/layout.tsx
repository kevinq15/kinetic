import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kinetic",
  description: "Kinetic — Centro de Acondicionamiento Físico",
};

// Header de marca fijo en TODAS las pantallas (incluido /login), así el
// Sprint 6 suma identidad visual en un solo lugar sin tener que tocar
// cada pantalla una por una. El resto de cada pantalla (título propio,
// botón "Volver", etc.) sigue como está por ahora.
function HeaderMarca() {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-brand-border bg-brand-header px-6 py-3.5 shadow-lg shadow-black/30">
      {/* Al header lo tocás desde cualquier pantalla y te vuelve al
          inicio — mismo criterio que un logo de header en casi
          cualquier sitio. Si no hay sesión, el middleware igual te
          termina mandando a /login, así que es inofensivo tocarlo ahí. */}
      <Link
        href="/"
        className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.03]"
      >
        {/* <img> común, no next/image: el optimizador de Next devolvía
            400 en desarrollo (falta "sharp" en Windows) y para un logo
            tan chico no vale la pena pelearse con eso. */}
        <img
          src="/logo-kinetic.png"
          alt="Kinetic"
          width={40}
          height={40}
          className="brand-logo-glow rounded-lg"
        />
        <div className="leading-tight">
          <p className="text-base font-black tracking-wide text-brand-text transition-colors group-hover:text-brand-primary">
            KINETIC
          </p>
          <p className="text-[11px] font-semibold tracking-wide text-brand-text-muted uppercase">
            Centro de Acondicionamiento Físico
          </p>
        </div>
      </Link>
    </header>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-brand-bg text-brand-text">
        <HeaderMarca />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
