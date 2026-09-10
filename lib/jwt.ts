import "server-only";
import { SignJWT, jwtVerify } from "jose";

// Duración de la sesión: 12 horas. Pasado ese tiempo hay que loguearse de nuevo.
const MAX_AGE_SECONDS = 60 * 60 * 12;

export type SesionUsuario = {
  usuarioId: string;
  usuario: string;
  nombre: string;
  cargo: "gerente" | "recepcionista" | "coach";
};

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Falta SESSION_SECRET en las variables de entorno.");
  }
  return new TextEncoder().encode(secret);
}

// Firma un JWT propio con los datos de la sesión. No tiene nada que ver
// con el token que devuelve Supabase Auth: ese lo usamos una sola vez,
// en el momento del login, solo para validar la contraseña.
export async function firmarSesion(datos: SesionUsuario): Promise<string> {
  return new SignJWT({ ...datos })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verificarSesion(
  token: string
): Promise<SesionUsuario | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SesionUsuario;
  } catch {
    // Token vencido, manipulado, o SESSION_SECRET distinto (ej. cambió
    // el secreto): tratamos todo como "no hay sesión válida".
    return null;
  }
}

export const SESSION_COOKIE = "kinetic_session";
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
