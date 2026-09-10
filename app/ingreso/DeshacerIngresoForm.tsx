"use client";

import { useActionState } from "react";
import { anularIngresoAction, type AnularIngresoState } from "./actions";

const estadoInicial: AnularIngresoState = { error: null };

// RF-ING-11 / HU-15: aparece pegado al aviso de "Ingreso confirmado" para
// deshacer un error al toque (socio o coach equivocado). No hace falta
// router.refresh() acá porque la propia acción redirige a esta misma
// pantalla, que se vuelve a renderizar con los datos ya actualizados.
export default function DeshacerIngresoForm({
  ingresoId,
  dni,
}: {
  ingresoId: string;
  dni: string;
}) {
  const [state, formAction, pending] = useActionState(
    anularIngresoAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-1">
      <input type="hidden" name="ingreso_id" value={ingresoId} />
      <input type="hidden" name="dni" value={dni} />
      <button
        type="submit"
        disabled={pending}
        className="w-fit text-sm font-medium text-red-700 underline hover:no-underline disabled:opacity-50"
      >
        {pending ? "Deshaciendo..." : "¿Fue un error? Deshacer este ingreso"}
      </button>
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
