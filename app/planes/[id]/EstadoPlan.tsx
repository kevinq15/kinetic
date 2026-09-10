"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cambiarEstadoPlanAction, type EstadoPlanState } from "./actions";

const estadoInicial: EstadoPlanState = { error: null };

export default function EstadoPlan({
  planId,
  activo,
}: {
  planId: string;
  activo: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    cambiarEstadoPlanAction,
    estadoInicial
  );
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={planId} />
      <input
        type="hidden"
        name="nuevo_estado"
        value={activo ? "false" : "true"}
      />

      {activo && (
        <p className="text-xs text-gray-500">
          Un plan dado de baja no se puede vender más, pero las ventas
          existentes lo siguen referenciando sin problema.
        </p>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className={
          activo
            ? "rounded border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50"
            : "rounded border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
        }
      >
        {pending
          ? "Procesando..."
          : activo
            ? "Dar de baja"
            : "Reactivar plan"}
      </button>
    </form>
  );
}
