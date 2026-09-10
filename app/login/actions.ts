"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { crearSesion } from "@/lib/session";

export type LoginState = {
  error: string | null;
};

// Convención interna: cada `usuario` tiene un mail sintético
// usuario@kinetic.local en Supabase Auth. El personal nunca ve ni usa
// ese mail, solo su "usuario". Ver comentario en schema-kinetic.sql.
const DOMINIO_SINTETICO = "kinetic.local";

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const usuario = String(formData.get("usuario") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!usuario || !password) {
    return { error: "[debug] falta usuario o password en el form" };
  }

  // 1. Buscamos el usuario por su handle.
  const { data: fila, error: errorConsulta } = await supabaseAdmin
    .from("usuarios")
    .select("id, nombre, cargo, activo, usuario")
    .eq("usuario", usuario)
    .maybeSingle();

  if (errorConsulta || !fila || !fila.activo) {
    return {
      error: `[debug] usuario tipeado="${usuario}" | fila=${JSON.stringify(
        fila
      )} | errorConsulta=${errorConsulta?.message ?? "ninguno"}`,
    };
  }

  // 2. Delegamos la validación de la contraseña en Supabase Auth.
  const mailSintetico = `${usuario}@${DOMINIO_SINTETICO}`;
  const { error: errorAuth } = await supabaseAdmin.auth.signInWithPassword({
    email: mailSintetico,
    password,
  });

  if (errorAuth) {
    return {
      error: `[debug] mail="${mailSintetico}" | errorAuth="${errorAuth.message}" | status=${errorAuth.status}`,
    };
  }

  // 3. Contraseña OK -> creamos nuestra propia sesión (cookie firmada).
  await crearSesion({
    usuarioId: fila.id,
    usuario,
    nombre: fila.nombre,
    cargo: fila.cargo,
  });

  redirect("/");
}
