"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { crearPlanAction, type CrearPlanState } from "../actions";
import { btnPrimary, input, label, textoError } from "@/lib/ui";

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
        <label htmlFor="nombre" className={label}>
          Nombre del plan
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          placeholder="Ej: Mensual, Trimestral..."
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
          defaultValue={30}
          className={input}
        />
        <p className="mt-1 text-xs text-brand-text-muted">
          Por defecto 30 días, pero se puede cambiar (ej. 90 para un plan
          trimestral).
        </p>
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
          required
          className={input}
        />
      </div>

      {state.error && (
        <p className={textoError} role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Creando..." : "Crear plan"}
      </button>
    </form>
  );
}
