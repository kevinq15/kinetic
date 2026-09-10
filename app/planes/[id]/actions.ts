"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";

// ---------- Editar datos (RF-PLA-01) ----------

export type EditarPlanState = {
  error: string | null;
  ok?: boolean;
};

export async function editarPlanAction(
  _prevState: EditarPlanState,
  formData: FormData
): Promise<EditarPlanState> {
  await requerirGerente();

  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const cantidadPases = Number(formData.get("cantidad_pases") ?? "");
  const duracionDias = Number(formData.get("duracion_dias") ?? "");
  const precio = Number(formData.get("precio") ?? "");

  if (!id || !nombre) {
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

  const { error } = await supabaseAdmin
    .from("planes")
    .update({
      nombre,
      cantidad_pases: cantidadPases,
      duracion_dias: duracionDias,
      precio,
    })
    .eq("id", id);

  if (error) {
    return { error: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath(`/planes/${id}`);
  revalidatePath("/planes");
  return { error: null, ok: true };
}

// ---------- Baja / reactivación (RF-PLA-01) ----------

export type EstadoPlanState = {
  error: string | null;
  ok?: boolean;
};

export async function cambiarEstadoPlanAction(
  _prevState: EstadoPlanState,
  formData: FormData
): Promise<EstadoPlanState> {
  await requerirGerente();

  const id = String(formData.get("id") ?? "");
  const nuevoEstado = String(formData.get("nuevo_estado") ?? "") === "true";

  const { error } = await supabaseAdmin
    .from("planes")
    .update({ activo: nuevoEstado })
    .eq("id", id);

  if (error) {
    return { error: `No se pudo actualizar el estado: ${error.message}` };
  }

  revalidatePath(`/planes/${id}`);
  revalidatePath("/planes");
  return { error: null, ok: true };
}
