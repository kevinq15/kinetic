"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { registrarEgresoAction, type EgresoState } from "./actions";

const estadoInicial: EgresoState = { error: null };

export default function EgresoForm() {
  const [state, formAction, pending] = useActionState(
    registrarEgresoAction,
    estadoInicial
  );
  // Los inputs no son controlados (usan defaultValue). Después de cada
  // alta exitosa cambiamos esta key para que React remonte el <form> y
  // los deje vacíos, listos para cargar el próximo egreso.
  const [key, setKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      setKey((k) => k + 1);
      // El saldo, el desglose y el historial de abajo los calcula el
      // Server Component de la página — hay que refrescarla para que
      // se actualicen con el egreso recién cargado.
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form
      key={key}
      action={formAction}
      className="flex max-w-sm flex-col gap-4"
    >
      <div>
        <label htmlFor="monto" className="mb-1 block text-sm font-medium">
          Monto
        </label>
        <input
          id="monto"
          name="monto"
          type="number"
          min={0.01}
          step="0.01"
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="motivo" className="mb-1 block text-sm font-medium">
          Motivo
        </label>
        <textarea
          id="motivo"
          name="motivo"
          required
          rows={3}
          placeholder="Ej: Pago a recepcionista — quincena de septiembre"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="text-sm text-green-700">Egreso registrado.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black py-2 font-medium text-white disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Registrar egreso"}
      </button>
    </form>
  );
}
