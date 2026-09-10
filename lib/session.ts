import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  firmarSesion,
  verificarSesion,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type SesionUsuario,
} from "@/lib/jwt";

// Estas funciones son las que usan las Server Actions y los componentes
// de servidor. El middleware NO puede usar `cookies()` de next/headers
// (no está disponible en ese contexto), por eso la lógica de
// firmar/verificar el token vive aparte, en lib/jwt.ts.

export async function crearSesion(datos: SesionUsuario) {
  const token = await firmarSesion(datos);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function obtenerSesion(): Promise<SesionUsuario | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verificarSesion(token);
}

export async function cerrarSesion() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Helper para pantallas exclusivas del Gerente (alta de usuarios,
// catálogo de planes, liquidaciones, caja, reportes...). Se usa al
// principio de cada Server Component de esas pantallas: si no hay
// sesión, o el cargo no es gerente, redirige y corta la ejecución ahí.
export async function requerirGerente(): Promise<SesionUsuario> {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.cargo !== "gerente") {
    redirect("/");
  }
  return sesion;
}
