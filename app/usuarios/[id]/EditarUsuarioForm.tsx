"use client";

import { useActionState } from "react";
import { editarUsuarioAction, type EditarUsuarioState } from "./actions";

const estadoInicial: EditarUsuarioState = { error: null };

type Usuario = {
  id: string;
  nombre: string;
  dni: string;
  mail: string | null;
  usuario: string;
  cargo: string;
};

export default function EditarUsuarioForm({ usuario }: { usuario: Usuario }) {
  const [state, formAction, pending] = useActionState(
    editarUsuarioAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <input type="hidden" name="id" value={usuario.id} />

      <div>
        <label className="mb-1 block text-sm font-medium">
          Usuario (no editable)
        </label>
        <input
          type="text"
          value={usuario.usuario}
          disabled
          className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-gray-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Cargo (no editable)
        </label>
        <input
          type="text"
          value={usuario.cargo}
          disabled
          className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 capitalize text-gray-500"
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
          defaultValue={usuario.nombre}
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="dni" className="mb-1 block text-sm font-medium">
          DNI
        </label>
        <input
          id="dni"
          name="dni"
          type="text"
          defaultValue={usuario.dni}
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="mail" className="mb-1 block text-sm font-medium">
          Mail (opcional)
        </label>
        <input
          id="mail"
          name="mail"
          type="email"
          defaultValue={usuario.mail ?? ""}
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
