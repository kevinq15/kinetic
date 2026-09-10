import Link from "next/link";
import { obtenerSesion } from "@/lib/session";
import { logoutAction } from "./actions";

export default async function Home() {
  const sesion = await obtenerSesion();

  // La protección real de esta ruta la hace middleware.ts (te redirige a
  // /login si no hay sesión). Esto es solo un resguardo extra por si
  // algún día se llama a este componente de otra forma.
  if (!sesion) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">
        Hola, {sesion.nombre} ({sesion.cargo})
      </h1>

      <Link
        href="/ingreso"
        className="rounded bg-black px-6 py-3 text-lg font-medium text-white"
      >
        Ingreso al gimnasio →
      </Link>

      <div className="flex flex-col items-center gap-2">
        {/* RF-VEN-01 / RF-USR-04: venta y disponibilidad las puede hacer
            Recepcionista, Coach o Gerente por igual, así que estos links
            son para cualquiera. */}
        <Link href="/socios" className="text-blue-600 hover:underline">
          Socios →
        </Link>
        <Link href="/coaches" className="text-blue-600 hover:underline">
          Disponibilidad de coaches →
        </Link>

        {sesion.cargo === "gerente" && (
          <>
            <Link href="/usuarios" className="text-blue-600 hover:underline">
              Gestionar usuarios internos →
            </Link>
            <Link href="/planes" className="text-blue-600 hover:underline">
              Gestionar catálogo de planes →
            </Link>
            <Link
              href="/liquidaciones"
              className="text-blue-600 hover:underline"
            >
              Liquidaciones →
            </Link>
            <Link
              href="/caja/egreso"
              className="text-blue-600 hover:underline"
            >
              Registrar egreso →
            </Link>
          </>
        )}
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
