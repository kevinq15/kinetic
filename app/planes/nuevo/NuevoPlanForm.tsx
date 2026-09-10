"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { crearPlanAction, type CrearPlanState } from "../actions";

const estadoInicial: CrearPlanState = { error: null };

export default function NuevoPlanForm() {
  const [state, formAction, pending] = useActionState(
    crearPlanAction,
    estadoInicial
  );
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.push("/planes");
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div>
        <label htmlFor="nombre" className="mb-1 block text-sm font-medium">
          Nombre del plan
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          placeholder="Ej: Mensual, Trimestral..."
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="cantidad_pases"
          className="mb-1 block text-sm font-medium"
        >
          Cantidad de pases
        </label>
        <input
          id="cantidad_pases"
          name="cantidad_pases"
          type="number"
          min={1}
          step={1}
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="duracion_dias"
          className="mb-1 block text-sm font-medium"
        >
          Duración en días
        </label>
        <input
          id="duracion_dias"
          name="duracion_dias"
          type="number"
          min={1}
          step={1}
          defaultValue={30}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Por defecto 30 días, pero se puede cambiar (ej. 90 para un plan
          trimestral).
        </p>
      </div>

      <div>
        <label htmlFor="precio" className="mb-1 block text-sm font-medium">
          Precio
        </label>
        <input
          id="precio"
          name="precio"
          type="number"
          min={0}
          step="0.01"
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
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
        {pending ? "Creando..." : "Crear plan"}
      </button>
    </form>
  );
}
