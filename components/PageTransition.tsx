"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Transición liviana entre pantallas: el header (layout.tsx) queda
// fijo afuera, así que lo único que necesita "entrar" en cada
// navegación es el contenido de abajo. Cambiar la `key` según la ruta
// hace que React desmonte/monte este <div> en cada cambio de pantalla,
// y eso alcanza para volver a disparar la animación de CSS — sin traer
// una librería de animaciones solo para esto.
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-page-fade flex flex-1 flex-col">
      {children}
    </div>
  );
}
