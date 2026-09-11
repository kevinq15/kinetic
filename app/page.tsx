import Link from "next/link";
import { obtenerSesion } from "@/lib/session";
import { logoutAction } from "./actions";
import { btnGhost, btnPrimaryLg, sectionTitle } from "@/lib/ui";

// Tarjetas de navegación del home — SVGs inline en vez de un ícono de
// librería, para no sumar una dependencia solo por esto. Mismo criterio
// que en el resto de la app: className fijo (no un prop `href`
// genérico) porque con las rutas tipadas de Next, un `href` que llega
// como `string` por prop pierde el chequeo de tipos que sí tiene un
// literal puesto directo en el JSX.
const tarjetaNav =
  "group flex items-center gap-4 rounded-2xl border-2 border-brand-border bg-brand-surface p-4 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-1 hover:border-brand-primary hover:bg-brand-surface-2 hover:shadow-xl hover:shadow-brand-primary/10";

const iconoWrap =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-black";

function IconoSocios() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconoCoach() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M6.5 6.5 17.5 17.5" />
      <path d="m21 3-3.5 1-1 3.5L3 21l3.5-1 1-3.5L21 3Z" />
    </svg>
  );
}

function IconoUsuarios() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m17 11 2 2 4-4" />
    </svg>
  );
}

function IconoPlanes() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 14h4" />
    </svg>
  );
}

function IconoLiquidaciones() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 1v22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconoCaja() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export default async function Home() {
  const sesion = await obtenerSesion();

  // La protección real de esta ruta la hace middleware.ts (te redirige a
  // /login si no hay sesión). Esto es solo un resguardo extra por si
  // algún día se llama a este componente de otra forma.
  if (!sesion) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-10 p-6 sm:p-10">
      <section className="flex w-full max-w-2xl flex-col items-center gap-6 pt-4 text-center sm:pt-8">
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-xs font-bold tracking-widest text-brand-text-muted uppercase">
            Hola de nuevo
          </p>
          <h1 className="brand-gradient-text text-4xl font-black tracking-tight sm:text-5xl">
            {sesion.nombre}
          </h1>
          <p className="text-sm font-bold text-brand-text-muted capitalize">
            {sesion.cargo}
          </p>
        </div>

        <Link href="/ingreso" className={`${btnPrimaryLg} w-full max-w-sm`}>
          Ingreso al gimnasio →
        </Link>
      </section>

      {/* RF-VEN-01 / RF-USR-04: venta y disponibilidad las puede hacer
          Recepcionista, Coach o Gerente por igual, así que esta sección
          es para cualquiera. */}
      <section className="flex w-full max-w-2xl flex-col gap-3">
        <h2 className={sectionTitle}>Operación diaria</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/socios" className={tarjetaNav}>
            <span className={iconoWrap}>
              <IconoSocios />
            </span>
            <span className="flex-1 text-sm font-bold text-brand-text">
              Socios
            </span>
            <span className="text-brand-primary transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link href="/coaches" className={tarjetaNav}>
            <span className={iconoWrap}>
              <IconoCoach />
            </span>
            <span className="flex-1 text-sm font-bold text-brand-text">
              Disponibilidad de coaches
            </span>
            <span className="text-brand-primary transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>

      {sesion.cargo === "gerente" && (
        <section className="flex w-full max-w-2xl flex-col gap-3">
          <h2 className={sectionTitle}>Administración</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href="/usuarios" className={tarjetaNav}>
              <span className={iconoWrap}>
                <IconoUsuarios />
              </span>
              <span className="flex-1 text-sm font-bold text-brand-text">
                Usuarios internos
              </span>
              <span className="text-brand-primary transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link href="/planes" className={tarjetaNav}>
              <span className={iconoWrap}>
                <IconoPlanes />
              </span>
              <span className="flex-1 text-sm font-bold text-brand-text">
                Catálogo de planes
              </span>
              <span className="text-brand-primary transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link href="/liquidaciones" className={tarjetaNav}>
              <span className={iconoWrap}>
                <IconoLiquidaciones />
              </span>
              <span className="flex-1 text-sm font-bold text-brand-text">
                Liquidaciones
              </span>
              <span className="text-brand-primary transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link href="/caja" className={tarjetaNav}>
              <span className={iconoWrap}>
                <IconoCaja />
              </span>
              <span className="flex-1 text-sm font-bold text-brand-text">
                Caja
              </span>
              <span className="text-brand-primary transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </section>
      )}

      <form action={logoutAction} className="mt-2">
        <button type="submit" className={btnGhost}>
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
