"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  anularLiquidacionAction,
  type AnularLiquidacionState,
} from "../actions";
import { btnDanger, textoError, textoExito } from "@/lib/ui";

const estadoInicial: AnularLiquidacionState = { error: null };

// RF-LIQ-09 / HU-16: anular la última liquidación de un coach. La base
// ya valida que sea efectivamente la más reciente — acá no hace falta
// repetir ese chequeo, solo mostrar el error si igual llega.
export default function AnularLiquidacionForm({
  liquidacionId,
  coachId,
}: {
  liquidacionId: string;
  coachId: string;
}) {
  const [state, formAction, pending] = useActionState(
    anularLiquidacionAction,
    estadoInicial
  );
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      // Vuelve a calcular el período pendiente (ConfirmarLiquidacionForm
      // más arriba en la página) con los entrenamientos ya liberados.
      router.refresh();
    }
  }, [state.ok, router]);

  if (state.ok) {
    return (
      <p className={textoExito}>
        Liquidación anulada. Los entrenamientos de ese período volvieron a
        quedar pendientes.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="liquidacion_id" value={liquidacionId} />
      <input type="hidden" name="coach_id" value={coachId} />
      {state.error && <p className={textoError}>{state.error}</p>}
      <button type="submit" disabled={pending} className={`${btnDanger} w-fit`}>
        {pending ? "Anulando..." : "Anular esta liquidación"}
      </button>
    </form>
  );
}
