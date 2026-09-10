"use server";

import { redirect } from "next/navigation";
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
