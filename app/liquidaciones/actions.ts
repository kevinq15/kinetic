"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";

export type LiquidacionState = {
  error: string | null;
};

// RF-LIQ-01 a 08 / RF-CAJ-03: confirmar la liquidación de un coach. Todo
// el cálculo real (período, cantidad, validaciones) vive en
// confirmar_liquidacion() en la base — acá solo se juntan los datos del
// form y se llama a la función.
export async function confirmarLiquidacionAction(
  _prevState: LiquidacionState,
  formData: FormData
): Promise<LiquidacionState> {
  const sesion = await requerirGerente();

  const coachId = String(formData.get("coach_id") ?? "").trim();
  const fechaCorte = String(formData.get("fecha_corte") ?? "").trim();
  const montoRaw = String(
    formData.get("monto_por_entrenamiento") ?? ""
  ).trim();
  const monto = Number(montoRaw);

  // RF-LIQ-05: la fecha de corte es opcional (vacía = liquidar hasta
  // ahora). Solo coachId y el monto son obligatorios acá.
  if (!coachId) {
    return { error: "Faltan datos para confirmar la liquidación." };
  }
  if (!Number.isFinite(monto) || monto < 0) {
    return { error: "El monto por entrenamiento no es válido." };
  }

  const { error } = await supabaseAdmin.rpc("confirmar_liquidacion", {
    p_coach_id: coachId,
    p_usuario_id: sesion.usuarioId,
    p_fecha_corte: fechaCorte || null,
    p_monto_por_entrenamiento: monto,
  });

  if (error) {
    return {
      error: `No se pudo confirmar la liquidación: ${error.message}`,
    };
  }

  redirect("/liquidaciones");
}

// ---------- Anular liquidación (RF-LIQ-09, HU-16) ----------

export type AnularLiquidacionState = {
  error: string | null;
  ok?: boolean;
};

// Solo se puede anular la liquidación más recente de un coach — la
// función en la base lo revalida y rechaza cualquier otra (ver el
// comentario de anular_liquidacion() en el schema para el motivo).
export async function anularLiquidacionAction(
  _prevState: AnularLiquidacionState,
  formData: FormData
): Promise<AnularLiquidacionState> {
  const sesion = await requerirGerente();

  const liquidacionId = String(formData.get("liquidacion_id") ?? "").trim();
  const coachId = String(formData.get("coach_id") ?? "").trim();

  if (!liquidacionId) {
    return { error: "No se encontró la liquidación." };
  }

  const { error } = await supabaseAdmin.rpc("anular_liquidacion", {
    p_liquidacion_id: liquidacionId,
    p_usuario_id: sesion.usuarioId,
  });

  if (error) {
    return { error: `No se pudo anular la liquidación: ${error.message}` };
  }

  revalidatePath(`/liquidaciones/${coachId}`);
  revalidatePath("/liquidaciones");
  return { error: null, ok: true };
}
