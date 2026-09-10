"use client";

import { useActionState } from "react";
import { registrarVentaAction, type VentaState } from "../actions";

const estadoInicial: VentaState = { error: null };

type Plan = {
  id: string;
  nombre: string;
  precio: number;
  cantidad_pases: number;
  duracion_dias: number;
};

type Socio = { id: string; nombre: string; dni: string };

export default function VentaForm({
  socio,
  planes,
}: {
  socio: Socio;
  planes: Plan[];
}) {
  const [state, formAction, pending] = useActionState(
    registrarVentaAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <input type="hidden" name="socio_id" value={socio.id} />
      <p className="text-sm text-gray-600">
        Socio: <span className="font-medium">{socio.nombre}</span> (DNI{" "}
        {socio.dni})
      </p>

      <div>
        <label htmlFor="plan_id" className="mb-1 block text-sm font-medium">
          Plan
        </label>
        <select
          id="plan_id"
          name="plan_id"
          required
          defaultValue=""
          className="w-full rounded border border-gray-300 px-3 py-2"
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
        <label
          htmlFor="porcentaje_descuento"
          className="mb-1 block text-sm font-medium"
        >
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
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="medio_pago" className="mb-1 block text-sm font-medium">
          Medio de pago
        </label>
        <select
          id="medio_pago"
          name="medio_pago"
          required
          defaultValue=""
          className="w-full rounded border border-gray-300 px-3 py-2"
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
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black py-2 font-medium text-white disabled:opacity-50"
      >
        {pending ? "Registrando..." : "Confirmar venta"}
      </button>
    </form>
  );
}
