"use client";

import { useActionState } from "react";
import { editarUsuarioAction, type EditarUsuarioState } from "./actions";
import { btnPrimary, input, label, textoError, textoExito } from "@/lib/ui";

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
        <label className={label}>Usuario (no editable)</label>
        <input
          type="text"
          value={usuario.usuario}
          disabled
          className={`${input} cursor-not-allowed opacity-60`}
        />
      </div>

      <div>
        <label className={label}>Cargo (no editable)</label>
        <input
          type="text"
          value={usuario.cargo}
          disabled
          className={`${input} cursor-not-allowed capitalize opacity-60`}
        />
      </div>

      <div>
        <label htmlFor="nombre" className={label}>
          Nombre completo
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          defaultValue={usuario.nombre}
          required
          className={input}
        />
      </div>

      <div>
        <label htmlFor="dni" className={label}>
          DNI
        </label>
        <input
          id="dni"
          name="dni"
          type="text"
          defaultValue={usuario.dni}
          required
          className={input}
        />
      </div>

      <div>
        <label htmlFor="mail" className={label}>
          Mail (opcional)
        </label>
        <input
          id="mail"
          name="mail"
          type="email"
          defaultValue={usuario.mail ?? ""}
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
