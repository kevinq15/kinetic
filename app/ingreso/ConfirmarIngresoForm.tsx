"use client";

import { useActionState } from "react";
import { confirmarIngresoAction, type IngresoState } from "./actions";
import { btnPrimaryLg, chip, chipInput, label, textoError } from "@/lib/ui";
import { BarbellSpinner } from "@/components/Spinner";

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
        <p className={label}>Entrena con</p>
        {/* RF-ING-03: la selección nunca queda vacía — viene con el
            Gerente preseleccionado. Son pocas opciones (los coaches
            disponibles hoy), así que unos "chips" grandes y tocables
            quedan mucho mejor en un mostrador/tablet que un <select>
            nativo perdido al lado de botones grandes — y siguen siendo
            radios de verdad, sin JS extra, para que el form ande igual. */}
        <div className="flex flex-wrap gap-2">
          {coaches.map((c) => (
            <label key={c.coachId}>
              <input
                type="radio"
                name="coach_id"
                value={c.coachId}
                required
                defaultChecked={c.coachId === coachPorDefecto}
                className={chipInput}
              />
              <span className={chip}>
                {c.nombre}
                {c.esGerente ? " · Gerente" : ""}
              </span>
            </label>
          ))}
        </div>
      </div>

      {state.error && (
        <p className={textoError} role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`${btnPrimaryLg} w-full`}
      >
        {pending ? (
          <>
            <BarbellSpinner className="h-4 w-4" />
            Confirmando...
          </>
        ) : (
          "Confirmar ingreso"
        )}
      </button>
    </form>
  );
}
