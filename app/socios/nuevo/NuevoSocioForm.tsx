"use client";

import { useActionState } from "react";
import { crearSocioAction, type CrearSocioState } from "../actions";

const estadoInicial: CrearSocioState = { error: null };

export default function NuevoSocioForm({
  dniPrellenado,
}: {
  dniPrellenado: string;
}) {
  const [state, formAction, pending] = useActionState(
    crearSocioAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <div>
        <label htmlFor="dni" className="mb-1 block text-sm font-medium">
          DNI
        </label>
        <input
          id="dni"
          name="dni"
          type="text"
          required
          defaultValue={dniPrellenado}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="nombre" className="mb-1 block text-sm font-medium">
          Nombre completo
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="fecha_nacimiento"
          className="mb-1 block text-sm font-medium"
        >
          Fecha de nacimiento (opcional)
        </label>
        <input
          id="fecha_nacimiento"
          name="fecha_nacimiento"
          type="date"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="telefono" className="mb-1 block text-sm font-medium">
          Teléfono (opcional)
        </label>
        <input
          id="telefono"
          name="telefono"
          type="text"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email (opcional)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="telefono_emergencia"
          className="mb-1 block text-sm font-medium"
        >
          Teléfono de emergencia (opcional)
        </label>
        <input
          id="telefono_emergencia"
          name="telefono_emergencia"
          type="text"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="observaciones"
          className="mb-1 block text-sm font-medium"
        >
          Observaciones (opcional)
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          rows={3}
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
        {pending ? "Guardando..." : "Crear socio"}
      </button>
    </form>
  );
}
