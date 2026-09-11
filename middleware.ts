import { NextRequest, NextResponse } from "next/server";
import { verificarSesion, SESSION_COOKIE } from "@/lib/jwt";

// Rutas a las que se puede entrar sin estar logueado.
const RUTAS_PUBLICAS = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const esPublica = RUTAS_PUBLICAS.some((ruta) => pathname.startsWith(ruta));

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const sesion = token ? await verificarSesion(token) : null;

  // No hay sesión válida y la ruta no es pública -> al login.
  if (!sesion && !esPublica) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Ya está logueado y quiere entrar al login -> lo mandamos adentro.
  if (sesion && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Corre en todo menos los archivos estáticos internos de Next Y los
  // archivos públicos propios (como /logo-kinetic.png). Sin la segunda
  // parte, un archivo suelto en /public quedaba atrapado como si fuera
  // una ruta protegida: sin sesión, el middleware lo redirigía a
  // /login (HTML) en vez de dejar pasar la imagen — el logo del header
  // se veía roto por este motivo, no por el archivo en sí.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
