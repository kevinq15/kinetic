"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { obtenerSesion, requerirGerente } from "@/lib/session";

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

// ---------- Anular venta (RF-VEN-05, RF-SOC-04, RF-CAJ-05) ----------

export type AnularVentaState = {
  error: string | null;
  advertencia?: { consumidos: number } | null;
  ok?: boolean;
};

export async function anularVentaAction(
  _prevState: AnularVentaState,
  formData: FormData
): Promise<AnularVentaState> {
  const sesion = await requerirGerente();

  const ventaId = String(formData.get("venta_id") ?? "").trim();
  const confirmado = formData.get("confirmado") === "true";

  if (!ventaId) {
    return { error: "No se encontró la venta." };
  }

  const { data: venta } = await supabaseAdmin
    .from("ventas")
    .select("id, socio_id, plan_id, pases_restantes, anulada")
    .eq("id", ventaId)
    .maybeSingle();

  if (!venta) {
    return { error: "No se encontró la venta." };
  }
  if (venta.anulada) {
    return { error: "Esta venta ya estaba anulada." };
  }

  // RF-VEN-05: si el socio ya consumió pases de este plan, se avisa (con
  // cuántos) y se pide confirmar antes de anular. No bloquea la anulación.
  if (!confirmado) {
    const { data: plan } = await supabaseAdmin
      .from("planes")
      .select("cantidad_pases")
      .eq("id", venta.plan_id)
      .maybeSingle();

    const consumidos = plan
      ? plan.cantidad_pases - venta.pases_restantes
      : 0;

    if (consumidos > 0) {
      return { error: null, advertencia: { consumidos } };
    }
  }

  const { error } = await supabaseAdmin.rpc("anular_venta", {
    p_venta_id: ventaId,
    p_usuario_id: sesion.usuarioId,
  });

  if (error) {
    return { error: `No se pudo anular la venta: ${error.message}` };
  }

  revalidatePath(`/socios/${venta.socio_id}`);
  return { error: null, ok: true };
}
