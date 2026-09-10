"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";

export type CrearPlanState = {
  error: string | null;
  ok?: boolean;
};

// RF-PLA-01: crear un tipo de plan (nombre, pases, duración, precio).
// RF-PLA-02: la duración no tiene un valor fijo -> el form manda uno,
// pero si viene vacío usamos el default de la tabla (30 días).
export async function crearPlanAction(
  _prevState: CrearPlanState,
  formData: FormData
): Promise<CrearPlanState> {
  await requerirGerente();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const cantidadPasesRaw = String(formData.get("cantidad_pases") ?? "");
  const duracionDiasRaw = String(formData.get("duracion_dias") ?? "");
  const precioRaw = String(formData.get("precio") ?? "");

  const cantidadPases = Number(cantidadPasesRaw);
  const duracionDias = duracionDiasRaw ? Number(duracionDiasRaw) : 30;
  const precio = Number(precioRaw);

  if (!nombre) {
    return { error: "El plan necesita un nombre." };
  }
  if (!Number.isInteger(cantidadPases) || cantidadPases <= 0) {
    return { error: "La cantidad de pases tiene que ser un entero mayor a 0." };
  }
  if (!Number.isInteger(duracionDias) || duracionDias <= 0) {
    return { error: "La duración en días tiene que ser un entero mayor a 0." };
  }
  if (!Number.isFinite(precio) || precio < 0) {
    return { error: "El precio tiene que ser un número mayor o igual a 0." };
  }

  const { error } = await supabaseAdmin.from("planes").insert({
    nombre,
    cantidad_pases: cantidadPases,
    duracion_dias: duracionDias,
    precio,
  });

  if (error) {
    return { error: `No se pudo crear el plan: ${error.message}` };
  }

  revalidatePath("/planes");
  return { error: null, ok: true };
}
