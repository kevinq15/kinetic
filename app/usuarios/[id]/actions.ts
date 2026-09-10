"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";

// ---------- Editar datos (RF-USR-06) ----------

export type EditarUsuarioState = {
  error: string | null;
  ok?: boolean;
};

export async function editarUsuarioAction(
  _prevState: EditarUsuarioState,
  formData: FormData
): Promise<EditarUsuarioState> {
  await requerirGerente();

  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const dni = String(formData.get("dni") ?? "").trim();
  const mail = String(formData.get("mail") ?? "").trim();

  if (!id || !nombre || !dni) {
    return { error: "Completá nombre y DNI." };
  }

  // Nota: `usuario` y `cargo` no se tocan acá a propósito — RF-USR-06 dice
  // que el nombre de usuario no se puede cambiar una vez creado, y el
  // cargo tampoco está entre los campos editables.
  const { error } = await supabaseAdmin
    .from("usuarios")
    .update({ nombre, dni, mail: mail || null })
    .eq("id", id);

  if (error) {
    if (error.message.includes("usuarios_dni_key")) {
      return { error: "Ya existe un usuario con ese DNI." };
    }
    return { error: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath(`/usuarios/${id}`);
  revalidatePath("/usuarios");
  return { error: null, ok: true };
}

// ---------- Restablecer contraseña (RF-USR-06) ----------

export type RestablecerPasswordState = {
  error: string | null;
  ok?: boolean;
};

export async function restablecerPasswordAction(
  _prevState: RestablecerPasswordState,
  formData: FormData
): Promise<RestablecerPasswordState> {
  await requerirGerente();

  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("auth_user_id")
    .eq("id", id)
    .maybeSingle();

  if (!usuario?.auth_user_id) {
    return { error: "No se encontró la cuenta." };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    usuario.auth_user_id,
    { password }
  );

  if (error) {
    return { error: `No se pudo cambiar la contraseña: ${error.message}` };
  }

  return { error: null, ok: true };
}

// ---------- Baja / reactivación (RF-USR-07, RF-USR-09, RF-USR-10) ----------

export type EstadoState = {
  error: string | null;
  advertencia?: { cantidad: number; monto: number } | null;
  ok?: boolean;
};

// Forma de la fila que devuelve la función de Postgres
// entrenamientos_pendientes(coach_id). supabase-js no conoce este tipo
// porque no generamos los tipos de la base (eso queda como mejora
// futura); se lo decimos a mano acá para que TypeScript no se queje.
type EntrenamientosPendientes = {
  cantidad: number;
  monto: number;
};

export async function cambiarEstadoAction(
  _prevState: EstadoState,
  formData: FormData
): Promise<EstadoState> {
  await requerirGerente();

  const id = String(formData.get("id") ?? "");
  const accion = String(formData.get("accion") ?? "");
  const confirmado = formData.get("confirmado") === "true";

  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("id, cargo, activo")
    .eq("id", id)
    .maybeSingle();

  if (!usuario) {
    return { error: "No se encontró el usuario." };
  }

  if (accion === "reactivar") {
    await supabaseAdmin.from("usuarios").update({ activo: true }).eq("id", id);
    revalidatePath(`/usuarios/${id}`);
    revalidatePath("/usuarios");
    return { error: null, ok: true };
  }

  // accion === "baja"

  // RF-USR-10: se chequea primero y con su propio mensaje, antes que
  // RF-USR-09 — el Gerente nunca se liquida, así que siempre tiene
  // entrenamientos "pendientes"; sin este orden el sistema rechazaría la
  // baja con el motivo equivocado.
  if (usuario.cargo === "gerente") {
    return { error: "La cuenta del Gerente no se puede dar de baja." };
  }

  // RF-USR-09: si es coach y tiene entrenamientos sin liquidar, se avisa
  // (con cantidad y monto) y se pide confirmar. No bloquea la baja.
  if (usuario.cargo === "coach" && !confirmado) {
    const { data: coach } = await supabaseAdmin
      .from("coaches")
      .select("id")
      .eq("usuario_id", id)
      .maybeSingle();

    if (coach) {
      const { data } = await supabaseAdmin
        .rpc("entrenamientos_pendientes", { p_coach_id: coach.id })
        .single();
      const pendientes = data as EntrenamientosPendientes | null;

      if (pendientes && pendientes.cantidad > 0) {
        return {
          error: null,
          advertencia: {
            cantidad: pendientes.cantidad,
            monto: pendientes.monto,
          },
        };
      }
    }
  }

  await supabaseAdmin.from("usuarios").update({ activo: false }).eq("id", id);
  revalidatePath(`/usuarios/${id}`);
  revalidatePath("/usuarios");
  return { error: null, ok: true };
}
