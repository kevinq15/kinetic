"use client";

import { useActionState } from "react";
import { registrarVentaAction, type VentaState } from "../actions";
import { btnPrimaryLg, card, chip, chipInput, input, label, select, textoError } from "@/lib/ui";
import { BarbellSpinner } from "@/components/Spinner";

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

      <div className={card}>
        <p className="text-sm text-brand-text-muted">
          Socio:{" "}
          <span className="font-medium text-brand-text">{socio.nombre}</span>{" "}
          (DNI {socio.dni})
        </p>
      </div>

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
        <p className={label}>Medio de pago</p>
        {/* Mismo criterio que el selector de coach en /ingreso: pocas
            opciones fijas, así que chips grandes ganan a un <select>
            nativo — y siguen siendo radios de verdad. */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "efectivo", label: "Efectivo" },
              { value: "tarjeta", label: "Tarjeta" },
              { value: "transferencia", label: "Transferencia" },
            ] as const
          ).map((opcion) => (
            <label key={opcion.value}>
              <input
                type="radio"
                name="medio_pago"
                value={opcion.value}
                required
                className={chipInput}
              />
              <span className={chip}>{opcion.label}</span>
            </label>
          ))}
        </div>
      </div>

      {state.error && (
        <p className={textoError} role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btnPrimaryLg} w-full`}>
        {pending ? (
          <>
            <BarbellSpinner className="h-4 w-4" />
            Registrando...
          </>
        ) : (
          "Confirmar venta"
        )}
      </button>
    </form>
  );
}
