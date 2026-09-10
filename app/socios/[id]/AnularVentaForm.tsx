"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { anularVentaAction, type AnularVentaState } from "./actions";

const estadoInicial: AnularVentaState = { error: null };

// RF-VEN-05: anular una venta cargada por error. Mismo patrón de
// confirmación en dos pasos que EstadoUsuario.tsx (RF-USR-09) — el campo
// oculto "confirmado" se deriva de state.advertencia, nunca de un
// useState local, para que el primer clic de confirmación ya viaje con
// el valor correcto.
export default function AnularVentaForm({ ventaId }: { ventaId: string }) {
  const [state, formAction, pending] = useActionState(
    anularVentaAction,
    estadoInicial
  );
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      // La sección "Plan actual" la arma el Server Component de la
      // página — hay que refrescarla para que muestre el plan anterior
      // reactivado (o "Sin plan actual").
      router.refresh();
    }
  }, [state.ok, router]);

  if (state.ok) {
    return null;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="venta_id" value={ventaId} />
      <input
        type="hidden"
        name="confirmado"
        value={state.advertencia ? "true" : "false"}
      />

      {state.advertencia && (
        <p className="max-w-xs text-sm text-amber-700">
          Este socio ya consumió {state.advertencia.consumidos} pase(s) de
          este plan. Los entrenamientos ya hechos no se deshacen — el coach
          que atendió cobra igual. ¿Confirmás anular la venta de todos
          modos?
        </p>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {pending
          ? "Procesando..."
          : state.advertencia
            ? "Confirmar anulación de todos modos"
            : "Anular venta"}
      </button>
    </form>
  );
}
