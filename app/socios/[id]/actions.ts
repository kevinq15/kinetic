"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { obtenerSesion } from "@/lib/session";

export type EditarSocioState = {
  error: string | null;
  ok?: boolean;
};

// RF-SOC-06: cualquier usuario interno logueado puede editar un socio,
// incluido su DNI (no es una pantalla exclusiva del Gerente).
export async function editarSocioAction(
  _prevState: EditarSocioState,
  formData: FormData
): Promise<EditarSocioState> {
  const sesion = await obtenerSesion();
  if (!sesion) {
    return { error: "Tenés que estar logueado." };
  }

  const id = String(formData.get("id") ?? "");
  const dni = String(formData.get("dni") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const fechaNacimiento = String(formData.get("fecha_nacimiento") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefonoEmergencia = String(
    formData.get("telefono_emergencia") ?? ""
  ).trim();
  const observaciones = String(formData.get("observaciones") ?? "").trim();

  if (!id || !dni || !nombre) {
    return { error: "DNI y nombre son obligatorios." };
  }

  const { error } = await supabaseAdmin
    .from("socios")
    .update({
      dni,
      nombre,
      fecha_nacimiento: fechaNacimiento || null,
      telefono: telefono || null,
      email: email || null,
      telefono_emergencia: telefonoEmergencia || null,
      observaciones: observaciones || null,
    })
    .eq("id", id);

  if (error) {
    if (error.message.includes("socios_dni_key")) {
      return { error: "Ya existe otro socio con ese DNI." };
    }
    return { error: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath(`/socios/${id}`);
  return { error: null, ok: true };
}
