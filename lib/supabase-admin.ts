import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno."
  );
}

// Cliente con la service_role key: ignora RLS por completo (por diseño,
// ver kinetic-arranque-definitivo.md). SOLO se importa desde Server
// Actions y Server Components. El paquete "server-only" hace que el
// build falle si por error algún día se importa desde un componente
// cliente, para que este archivo nunca termine en el bundle del navegador.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
