"use client";

import { useActionState, useState } from "react";
import {
  confirmarLiquidacionAction,
  type LiquidacionState,
} from "../actions";

const estadoInicial: LiquidacionState = { error: null };

export default function ConfirmarLiquidacionForm({
  coachId,
  fechaCorte,
  montoSugerido,
  cantidad,
}: {
  coachId: string;
  fechaCorte: string;
  montoSugerido: number;
  cantidad: number;
}) {
  const [state, formAction, pending] = useActionState(
    confirmarLiquidacionAction,
    estadoInicial
  );
  // Se guarda como texto, no como número: si fuera número, borrar el
  // campo dejaba Number("") = 0 y el input volvía a mostrar "0" solo,
  // sin dejar escribir un valor nuevo desde cero.
  const [montoTexto, setMontoTexto] = useState(String(montoSugerido));
  const monto = Number(montoTexto) || 0;

  const total = monto * cantidad;

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <input type="hidden" name="coach_id" value={coachId} />
      <input type="hidden" name="fecha_corte" value={fechaCorte} />

      <div>
        <label htmlFor="monto" className="mb-1 block text-sm font-medium">
          Monto por entrenamiento
        </label>
        <input
          id="monto"
          name="monto_por_entrenamiento"
          type="number"
          min={0}
          step="0.01"
          required
          value={montoTexto}
          onChange={(e) => setMontoTexto(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <p className="text-sm">
        Total a pagar: {cantidad} × ${monto} ={" "}
        <span className="font-medium">${total.toFixed(2)}</span>
      </p>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black py-2 font-medium text-white disabled:opacity-50"
      >
        {pending ? "Confirmando..." : "Confirmar liquidación"}
      </button>
    </form>
  );
}
