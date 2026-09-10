"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { obtenerSesion } from "@/lib/session";

export type CrearSocioState = {
  error: string | null;
};

// RF-SOC-01, RF-SOC-02: el alta de un socio es independiente de la venta
// de un plan (por ejemplo, para pre-cargar socios conocidos el primer día
// de uso del sistema y venderles el plan después, cuando se acerquen a
// pagar). Por eso esta acción inserta solo en `socios`, sin tocar `ventas`
// ni `movimientos_caja` — no hace falta envolverla en una función de
// Postgres porque escribe en una sola tabla.
export async function crearSocioAction(
  _prevState: CrearSocioState,
  formData: FormData
): Promise<CrearSocioState> {
  const sesion = await obtenerSesion();
  if (!sesion) {
    return { error: "Tenés que estar logueado." };
  }

  const dni = String(formData.get("dni") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const fechaNacimiento = String(formData.get("fecha_nacimiento") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefonoEmergencia = String(
    formData.get("telefono_emergencia") ?? ""
  ).trim();
  const observaciones = String(formData.get("observaciones") ?? "").trim();

  if (!dni || !nombre) {
    return { error: "DNI y nombre son obligatorios." };
  }

  const { data, error } = await supabaseAdmin
    .from("socios")
    .insert({
      dni,
      nombre,
      fecha_nacimiento: fechaNacimiento || null,
      telefono: telefono || null,
      email: email || null,
      telefono_emergencia: telefonoEmergencia || null,
      observaciones: observaciones || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.message.includes("socios_dni_key")) {
      return { error: "Ya existe un socio con ese DNI." };
    }
    return {
      error: `No se pudo crear el socio: ${error?.message ?? "error desconocido"}`,
    };
  }

  redirect(`/socios/${data.id}`);
}
