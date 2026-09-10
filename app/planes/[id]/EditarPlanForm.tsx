"use client";

import { useActionState } from "react";
import { editarPlanAction, type EditarPlanState } from "./actions";

const estadoInicial: EditarPlanState = { error: null };

type Plan = {
  id: string;
  nombre: string;
  cantidad_pases: number;
  duracion_dias: number;
  precio: number;
};

export default function EditarPlanForm({ plan }: { plan: Plan }) {
  const [state, formAction, pending] = useActionState(
    editarPlanAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <input type="hidden" name="id" value={plan.id} />

      <div>
        <label htmlFor="nombre" className="mb-1 block text-sm font-medium">
          Nombre del plan
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          defaultValue={plan.nombre}
          required
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
          defaultValue={plan.cantidad_pases}
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
          defaultValue={plan.duracion_dias}
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
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
          defaultValue={plan.precio}
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">Guardado.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black py-2 font-medium text-white disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
