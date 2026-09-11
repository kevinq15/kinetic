"use client";

import { useActionState } from "react";
import { venderPlanIngresoAction, type VentaIngresoState } from "./actions";
import { btnPrimary, label, select, input, textoError } from "@/lib/ui";

const estadoInicial: VentaIngresoState = { error: null };

type Plan = {
  id: string;
  nombre: string;
  precio: number;
  cantidad_pases: number;
  duracion_dias: number;
};

export default function VenderPlanInline({
  socioId,
  dni,
  planes,
}: {
  socioId: string;
  dni: string;
  planes: Plan[];
}) {
  const [state, formAction, pending] = useActionState(
    venderPlanIngresoAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="socio_id" value={socioId} />
      <input type="hidden" name="dni" value={dni} />

      <div>
        <label htmlFor="plan_id" className={label}>
          Plan
        </label>
        <select
          id="plan_id"
          name="plan_id"
          required
          defaultValue=""
          className={select}
        >
          <option value="" disabled>
            Elegir...
          </option>
          {planes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} — {p.cantidad_pases} pases, {p.duracion_dias} días — $
              {p.precio}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="porcentaje_descuento" className={label}>
          Descuento (%)
        </label>
        <input
          id="porcentaje_descuento"
          name="porcentaje_descuento"
          type="number"
          min={0}
          max={100}
          step="0.01"
          defaultValue={0}
          className={input}
        />
      </div>

      <div>
        <label htmlFor="medio_pago" className={label}>
          Medio de pago
        </label>
        <select
          id="medio_pago"
          name="medio_pago"
          required
          defaultValue=""
          className={select}
        >
          <option value="" disabled>
            Elegir...
          </option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>

      {state.error && (
        <p className={textoError} role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Vendiendo..." : "Vender y habilitar"}
      </button>
    </form>
  );
}
