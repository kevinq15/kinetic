import "server-only";
import { cookies } from "next/headers";
import {
  firmarSesion,
  verificarSesion,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type SesionUsuario,
} from "@/lib/jwt";

// Estas tres funciones son las que usan las Server Actions y los
// componentes de servidor. El middleware NO puede usar `cookies()` de
// next/headers (no está disponible en ese contexto), por eso la lógica
// de firmar/verificar el token vive aparte, en lib/jwt.ts.

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
