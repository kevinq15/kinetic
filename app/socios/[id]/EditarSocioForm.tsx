"use client";

import { useActionState } from "react";
import { editarSocioAction, type EditarSocioState } from "./actions";

const estadoInicial: EditarSocioState = { error: null };

type Socio = {
  id: string;
  dni: string;
  nombre: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  email: string | null;
  telefono_emergencia: string | null;
  observaciones: string | null;
};

export default function EditarSocioForm({ socio }: { socio: Socio }) {
  const [state, formAction, pending] = useActionState(
    editarSocioAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <input type="hidden" name="id" value={socio.id} />

      <div>
        <label htmlFor="dni" className="mb-1 block text-sm font-medium">
          DNI
        </label>
        <input
          id="dni"
          name="dni"
          type="text"
          defaultValue={socio.dni}
          required
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
          defaultValue={socio.nombre}
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
          defaultValue={socio.fecha_nacimiento ?? ""}
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
          defaultValue={socio.telefono ?? ""}
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
          defaultValue={socio.email ?? ""}
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
          defaultValue={socio.telefono_emergencia ?? ""}
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
          defaultValue={socio.observaciones ?? ""}
          rows={3}
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
