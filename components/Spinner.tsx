// Ícono de "barra con discos" para estados de carga (botones en
// pending, pantalla de carga global) — mismo lenguaje que un spinner
// de toda la vida, con la forma de algo del gimnasio en vez de un
// círculo genérico. La animación (giro continuo) vive en
// app/globals.css como .animate-barbell-spin.
export function BarbellSpinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`animate-barbell-spin ${className}`}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeLinecap="round">
        <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2.2" />
        <line x1="4" y1="8" x2="4" y2="16" strokeWidth="3.4" />
        <line x1="20" y1="8" x2="20" y2="16" strokeWidth="3.4" />
        <line x1="1.4" y1="9.5" x2="1.4" y2="14.5" strokeWidth="2.6" />
        <line x1="22.6" y1="9.5" x2="22.6" y2="14.5" strokeWidth="2.6" />
      </g>
    </svg>
  );
}

// Huellita de lobo — se usa en la pantalla de carga global
// (app/loading.tsx) en una fila de 3 con animation-delay escalonado,
// como si el lobo fuera caminando mientras se espera al servidor.
export function PawPrint({
  className = "h-3.5 w-3.5",
  delayMs = 0,
}: {
  className?: string;
  delayMs?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`animate-paw-step ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="16.5" rx="5.2" ry="4.2" />
      <ellipse cx="5" cy="9" rx="2.1" ry="2.7" />
      <ellipse cx="10.3" cy="5.7" rx="2.1" ry="2.7" />
      <ellipse cx="15.7" cy="5.7" rx="2.1" ry="2.7" />
      <ellipse cx="19.5" cy="9.3" rx="2.1" ry="2.7" />
    </svg>
  );
}
