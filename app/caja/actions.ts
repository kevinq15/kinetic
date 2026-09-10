"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";

export type EgresoState = {
  error: string | null;
  ok?: boolean;
};

// RF-CAJ-03 / RF-USR-05: egreso manual de caja, exclusivo del Gerente,
// con motivo en texto libre. El caso típico es pagarle a un
// Recepcionista, que no pasa por el módulo de liquidaciones porque no
// tiene perfil de coach. Escribe en una sola tabla (movimientos_caja),
// no hace falta una función de Postgres.
export async function registrarEgresoAction(
  _prevState: EgresoState,
  formData: FormData
): Promise<EgresoState> {
  const sesion = await requerirGerente();

  const montoRaw = String(formData.get("monto") ?? "").trim();
  const motivo = String(formData.get("motivo") ?? "").trim();
  const monto = Number(montoRaw);

  if (!Number.isFinite(monto) || monto <= 0) {
    return { error: "El monto tiene que ser un número mayor a 0." };
  }
  if (!motivo) {
    return { error: "El motivo es obligatorio." };
  }

  const { error } = await supabaseAdmin.from("movimientos_caja").insert({
    tipo: "egreso",
    monto,
    motivo,
    usuario_id: sesion.usuarioId,
  });

  if (error) {
    return { error: `No se pudo registrar el egreso: ${error.message}` };
  }

  return { error: null, ok: true };
}
