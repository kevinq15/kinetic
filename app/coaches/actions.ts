"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { obtenerSesion } from "@/lib/session";

export type DisponibilidadState = {
  error: string | null;
  ok?: boolean;
};

// RF-ING-10 / RF-USR-04: cualquier usuario logueado puede cambiar la
// disponibilidad de un coach, no es una pantalla exclusiva del Gerente.
// El Gerente es la única excepción: siempre está disponible y no se lo
// puede marcar como no disponible, porque es el coach asignado por
// defecto del ingreso (RF-ING-03). Esa excepción se controla acá, no solo
// en la UI, por las dudas.
export async function cambiarDisponibilidadAction(
  _prevState: DisponibilidadState,
  formData: FormData
): Promise<DisponibilidadState> {
  const sesion = await obtenerSesion();
  if (!sesion) {
    return { error: "Tenés que estar logueado." };
  }

  const coachId = String(formData.get("id") ?? "");
  const nuevoValor = String(formData.get("nuevo_estado") ?? "") === "true";

  if (!coachId) {
    return { error: "Falta el coach." };
  }

  const { data: coach } = await supabaseAdmin
    .from("coaches")
    .select("usuario_id")
    .eq("id", coachId)
    .maybeSingle();

  if (!coach) {
    return { error: "No se encontró ese coach." };
  }

  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("cargo")
    .eq("id", coach.usuario_id)
    .maybeSingle();

  if (usuario?.cargo === "gerente" && !nuevoValor) {
    return {
      error: "El Gerente siempre está disponible: no se lo puede desmarcar.",
    };
  }

  const { error } = await supabaseAdmin
    .from("coaches")
    .update({ disponible: nuevoValor })
    .eq("id", coachId);

  if (error) {
    return { error: `No se pudo actualizar: ${error.message}` };
  }

  return { error: null, ok: true };
}
