"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { obtenerSesion } from "@/lib/session";

export type VentaState = {
  error: string | null;
};

// Forma de la fila que devuelve registrar_venta(...). Lo anotamos a mano
// porque no generamos tipos de la base de datos (ver nota en
// entrenamientos_pendientes, mismo motivo).
type VentaRow = {
  id: string;
  socio_id: string;
};

const MEDIOS_PAGO = ["efectivo", "tarjeta", "transferencia"] as const;

// RF-SOC-02: la venta ya no puede crear un socio nuevo de paso — el socio
// tiene que existir de antes (se lo crea por separado en /socios/nuevo).
// Por eso `registrar_venta` en la base ahora solo recibe socio_id, no los
// datos de un socio nuevo.
export async function registrarVentaAction(
  _prevState: VentaState,
  formData: FormData
): Promise<VentaState> {
  const sesion = await obtenerSesion();
  if (!sesion) {
    return { error: "Tenés que estar logueado." };
  }

  const socioId = String(formData.get("socio_id") ?? "").trim();
  const planId = String(formData.get("plan_id") ?? "").trim();
  const descuentoRaw = String(formData.get("porcentaje_descuento") ?? "0").trim();
  const medioPago = String(formData.get("medio_pago") ?? "");

  const porcentajeDescuento = descuentoRaw === "" ? 0 : Number(descuentoRaw);

  if (!socioId) {
    return { error: "Falta el socio." };
  }
  if (!planId) {
    return { error: "Elegí un plan." };
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

  const { data, error } = await supabaseAdmin
    .rpc("registrar_venta", {
      p_socio_id: socioId,
      p_plan_id: planId,
      p_usuario_id: sesion.usuarioId,
      p_porcentaje_descuento: porcentajeDescuento,
      p_medio_pago: medioPago,
    })
    .single();

  if (error || !data) {
    return {
      error: `No se pudo registrar la venta: ${error?.message ?? "error desconocido"}`,
    };
  }

  const venta = data as VentaRow;
  redirect(`/socios/${venta.socio_id}`);
}
