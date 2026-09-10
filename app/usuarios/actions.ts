"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";

export type CrearUsuarioState = {
  error: string | null;
  ok?: boolean;
};

// Misma convención que en el login: mail sintético usuario@kinetic.local.
const DOMINIO_SINTETICO = "kinetic.local";

export async function crearUsuarioAction(
  _prevState: CrearUsuarioState,
  formData: FormData
): Promise<CrearUsuarioState> {
  // RF-USR-01: solo el Gerente puede crear usuarios internos.
  await requerirGerente();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const dni = String(formData.get("dni") ?? "").trim();
  const mail = String(formData.get("mail") ?? "").trim();
  const usuario = String(formData.get("usuario") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const cargo = String(formData.get("cargo") ?? "");

  if (!nombre || !dni || !usuario || !password) {
    return { error: "Completá nombre, DNI, usuario y contraseña." };
  }
  // RF-USR-08: el formulario de alta solo ofrece estos dos cargos.
  if (cargo !== "recepcionista" && cargo !== "coach") {
    return { error: "Cargo inválido." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const mailSintetico = `${usuario}@${DOMINIO_SINTETICO}`;

  // 1. Cuenta de Supabase Auth (no es parte de nuestra base, no se puede
  // meter en la misma transacción que el paso 2).
  const { data: authData, error: errorAuth } =
    await supabaseAdmin.auth.admin.createUser({
      email: mailSintetico,
      password,
      email_confirm: true,
    });

  if (errorAuth || !authData?.user) {
    if (errorAuth?.code === "email_exists") {
      return { error: "Ese nombre de usuario ya está en uso." };
    }
    return {
      error: `No se pudo crear la cuenta: ${errorAuth?.message ?? "error desconocido"}`,
    };
  }

  // 2. usuarios (+ coaches si corresponde) en una única transacción real,
  // vía la función de Postgres crear_usuario_interno.
  const { error: errorFuncion } = await supabaseAdmin.rpc(
    "crear_usuario_interno",
    {
      p_auth_user_id: authData.user.id,
      p_dni: dni,
      p_nombre: nombre,
      p_mail: mail || null,
      p_usuario: usuario,
      p_cargo: cargo,
    }
  );

  if (errorFuncion) {
    // El paso 2 falló: no dejamos huérfana la cuenta de Auth del paso 1.
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

    if (errorFuncion.message.includes("usuarios_dni_key")) {
      return { error: "Ya existe un usuario con ese DNI." };
    }
    if (errorFuncion.message.includes("usuarios_usuario_key")) {
      return { error: "Ese nombre de usuario ya está en uso." };
    }
    return { error: `No se pudo crear el usuario: ${errorFuncion.message}` };
  }

  revalidatePath("/usuarios");
  return { error: null, ok: true };
}
