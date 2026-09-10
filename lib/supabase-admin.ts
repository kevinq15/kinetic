import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno."
  );
}

const fetchSinCache: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

// Cliente ÚNICO y compartido para TODAS las lecturas/escrituras a las
// tablas, con la service_role key (ignora RLS, ver
// kinetic-arranque-definitivo.md). SOLO se importa desde Server Actions
// y Server Components ("server-only" hace fallar el build si algún día
// se importa desde un componente cliente).
//
// IMPORTANTE: nunca llamar a `.auth.signInWithPassword` (ni ningún otro
// método que inicie sesión como un usuario real) sobre ESTE cliente.
// Ese método deja guardada en memoria la sesión de ese usuario dentro
// del cliente, y como este objeto se reutiliza en todos los pedidos
// mientras el servidor sigue corriendo, las consultas siguientes
// empezarían a usar el token de esa persona en vez de la service_role
// key. Para validar contraseñas, usar `crearClienteDeVerificacion()`.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: fetchSinCache,
  },
});

// Cliente "de un solo uso", exclusivo para validar usuario/contraseña
// contra Supabase Auth (signInWithPassword). Se crea uno nuevo en cada
// llamada para que la sesión que queda en memoria muera con él, y nunca
// contamine al `supabaseAdmin` compartido.
export function crearClienteDeVerificacion() {
  return createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: fetchSinCache,
    },
  });
}
