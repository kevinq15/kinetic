"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cambiarEstadoAction, type EstadoState } from "./actions";

const estadoInicial: EstadoState = { error: null };

export default function EstadoUsuario({
  usuarioId,
  activo,
}: {
  usuarioId: string;
  activo: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    cambiarEstadoAction,
    estadoInicial
  );
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      // Refresca los datos del Server Component (la prop `activo`) sin
      // perder el estado del cliente.
      router.refresh();
    }
  }, [state.ok, router]);

  if (!activo) {
    return (
      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={usuarioId} />
        <input type="hidden" name="accion" value="reactivar" />
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
        >
          {pending ? "Reactivando..." : "Reactivar usuario"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </form>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={usuarioId} />
      <input type="hidden" name="accion" value="baja" />
      <input
        type="hidden"
        name="confirmado"
        value={state.advertencia ? "true" : "false"}
      />

      {state.advertencia && (
        <p className="text-sm text-amber-700">
          Este coach tiene {state.advertencia.cantidad} entrenamiento(s) sin
          liquidar, por ${state.advertencia.monto}. Va a seguir apareciendo en
          la pantalla de liquidación hasta que se le pague. ¿Confirmás la baja
          igual?
        </p>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50"
      >
        {pending
          ? "Procesando..."
          : state.advertencia
            ? "Confirmar baja de todos modos"
            : "Dar de baja"}
      </button>
    </form>
  );
}
