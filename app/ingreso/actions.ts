"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { obtenerSesion } from "@/lib/session";

export type IngresoState = {
  error: string | null;
};

// RF-ING-01 a 09: confirmar el ingreso de un socio ya validado en la
// pantalla. La revalidación real (pases, vencimiento, coach disponible)
// vive en confirmar_ingreso() en la base, no acá — esto es solo el borde
// que junta los datos del form y llama a la función.
export async function confirmarIngresoAction(
  _prevState: IngresoState,
  formData: FormData
): Promise<IngresoState> {
  const sesion = await obtenerSesion();
  if (!sesion) {
    return { error: "Tenés que estar logueado." };
  }

  const socioId = String(formData.get("socio_id") ?? "").trim();
  const coachId = String(formData.get("coach_id") ?? "").trim();
  const dni = String(formData.get("dni") ?? "").trim();

  if (!socioId || !coachId) {
    return { error: "Faltan datos para confirmar el ingreso." };
  }

  const { error } = await supabaseAdmin.rpc("confirmar_ingreso", {
    p_socio_id: socioId,
    p_coach_id: coachId,
    p_usuario_id: sesion.usuarioId,
  });

  if (error) {
    return { error: `No se pudo confirmar el ingreso: ${error.message}` };
  }

  redirect(`/ingreso?dni=${encodeURIComponent(dni)}&ok=1`);
}

export type VentaIngresoState = {
  error: string | null;
};

const MEDIOS_PAGO = ["efectivo", "tarjeta", "transferencia"] as const;

// RF-ING-06: vender un plan nuevo sin salir de la pantalla de ingreso,
// cuando la validación falló. Llama a la misma registrar_venta(...) que
// usa /ventas/nueva, pero al terminar vuelve acá (con el DNI ya
// cargado) en vez de ir a la ficha del socio, para poder confirmar el
// ingreso en el mismo lugar donde se vendió el plan.
export async function venderPlanIngresoAction(
  _prevState: VentaIngresoState,
  formData: FormData
): Promise<VentaIngresoState> {
  const sesion = await obtenerSesion();
  if (!sesion) {
    return { error: "Tenés que estar logueado." };
  }

  const socioId = String(formData.get("socio_id") ?? "").trim();
  const dni = String(formData.get("dni") ?? "").trim();
  const planId = String(formData.get("plan_id") ?? "").trim();
  const descuentoRaw = String(
    formData.get("porcentaje_descuento") ?? "0"
  ).trim();
  const medioPago = String(formData.get("medio_pago") ?? "");

  const porcentajeDescuento = descuentoRaw === "" ? 0 : Number(descuentoRaw);

  if (!socioId || !planId) {
    return { error: "Faltan datos de la venta." };
  }
  if (
    !Number.isFinite(porcentajeDescuento) ||
    porcentajeDescuento < 0 ||
    porcentajeDescuento > 100
  ) {
    return { error: "El descuento tiene que estar entre 0 y 100." };
  }
  if (!MEDIOS_PAGO.includes(medioPago as (typeof MEDIOS_PAGO)[number])) {
    return { error: "Elegí un medio de pago." };
  }

  const { error } = await supabaseAdmin.rpc("registrar_venta", {
    p_socio_id: socioId,
    p_plan_id: planId,
    p_usuario_id: sesion.usuarioId,
    p_porcentaje_descuento: porcentajeDescuento,
    p_medio_pago: medioPago,
  });

  if (error) {
    return {
      error: `No se pudo registrar la venta: ${error.message}`,
    };
  }

  redirect(`/ingreso?dni=${encodeURIComponent(dni)}`);
}
