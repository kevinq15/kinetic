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
      <p className="text-gray-600">
        Sprint 1 en construcción — esta es la pantalla base ya logueada.
      </p>
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
