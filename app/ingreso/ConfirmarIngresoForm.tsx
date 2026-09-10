"use client";

import { useActionState } from "react";
import { confirmarIngresoAction, type IngresoState } from "./actions";

const estadoInicial: IngresoState = { error: null };

type CoachOpcion = { coachId: string; nombre: string; esGerente: boolean };

export default function ConfirmarIngresoForm({
  socioId,
  dni,
  coaches,
  coachPorDefecto,
}: {
  socioId: string;
  dni: string;
  coaches: CoachOpcion[];
  coachPorDefecto: string;
}) {
  const [state, formAction, pending] = useActionState(
    confirmarIngresoAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="socio_id" value={socioId} />
      <input type="hidden" name="dni" value={dni} />

      <div>
        <label htmlFor="coach_id" className="mb-1 block text-sm font-medium">
          Entrena con
        </label>
        {/* RF-ING-03: la selección nunca queda vacía — viene con el
            Gerente preseleccionado. */}
        <select
          id="coach_id"
          name="coach_id"
          required
          defaultValue={coachPorDefecto}
          className="w-full rounded border border-gray-300 px-3 py-2"
        >
          {coaches.map((c) => (
            <option key={c.coachId} value={c.coachId}>
              {c.nombre}
              {c.esGerente ? " (Gerente)" : ""}
            </option>
          ))}
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
        className="rounded bg-black py-3 text-lg font-medium text-white disabled:opacity-50"
      >
        {pending ? "Confirmando..." : "Confirmar ingreso"}
      </button>
    </form>
  );
}
