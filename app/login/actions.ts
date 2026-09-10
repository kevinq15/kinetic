"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin, crearClienteDeVerificacion } from "@/lib/supabase-admin";
import { crearSesion } from "@/lib/session";

export type LoginState = {
  error: string | null;
};

// Convención interna: cada `usuario` tiene un mail sintético
// usuario@kinetic.local en Supabase Auth. El personal nunca ve ni usa
// ese mail, solo su "usuario". Ver comentario en schema-kinetic.sql.
const DOMINIO_SINTETICO = "kinetic.local";

// Mensaje único para cualquier motivo de fallo (usuario inexistente,
// usuario dado de baja, o contraseña incorrecta), para no revelar
// cuál de los tres pasó.
const ERROR_GENERICO = "Usuario o contraseña incorrectos.";

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const usuario = String(formData.get("usuario") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!usuario || !password) {
    return { error: ERROR_GENERICO };
  }

  // 1. Buscamos el usuario por su handle, con el cliente compartido.
  // RF-USR-07: uno dado de baja (activo = false) no puede loguearse,
  // aunque la contraseña sea correcta.
  const { data: fila, error: errorConsulta } = await supabaseAdmin
    .from("usuarios")
    .select("id, nombre, cargo, activo")
    .eq("usuario", usuario)
    .maybeSingle();

  if (errorConsulta || !fila || !fila.activo) {
    return { error: ERROR_GENERICO };
  }

  // 2. Delegamos la validación de la contraseña en Supabase Auth, con un
  // cliente aparte y descartable — ver el comentario en
  // lib/supabase-admin.ts sobre por qué no se puede usar supabaseAdmin acá.
  const mailSintetico = `${usuario}@${DOMINIO_SINTETICO}`;
  const clienteVerificacion = crearClienteDeVerificacion();
  const { error: errorAuth } = await clienteVerificacion.auth.signInWithPassword({
    email: mailSintetico,
    password,
  });

  if (errorAuth) {
    return { error: ERROR_GENERICO };
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
