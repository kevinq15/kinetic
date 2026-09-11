"use client";

import { useActionState } from "react";
import { editarPlanAction, type EditarPlanState } from "./actions";
import { btnPrimary, input, label, textoError, textoExito } from "@/lib/ui";

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
        <label htmlFor="nombre" className={label}>
          Nombre del plan
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          defaultValue={plan.nombre}
          required
          className={input}
        />
      </div>

      <div>
        <label htmlFor="cantidad_pases" className={label}>
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
          className={input}
        />
      </div>

      <div>
        <label htmlFor="duracion_dias" className={label}>
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
          className={input}
        />
      </div>

      <div>
        <label htmlFor="precio" className={label}>
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
          className={input}
        />
      </div>

      {state.error && <p className={textoError}>{state.error}</p>}
      {state.ok && <p className={textoExito}>Guardado.</p>}

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
