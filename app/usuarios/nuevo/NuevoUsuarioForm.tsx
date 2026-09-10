"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { crearUsuarioAction, type CrearUsuarioState } from "../actions";

const estadoInicial: CrearUsuarioState = { error: null };

export default function NuevoUsuarioForm() {
  const [state, formAction, pending] = useActionState(
    crearUsuarioAction,
    estadoInicial
  );
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.push("/usuarios");
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
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
        <label htmlFor="dni" className="mb-1 block text-sm font-medium">
          DNI
        </label>
        <input
          id="dni"
          name="dni"
          type="text"
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
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="cargo" className="mb-1 block text-sm font-medium">
          Cargo
        </label>
        <select
          id="cargo"
          name="cargo"
          required
          defaultValue=""
          className="w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="" disabled>
            Elegir...
          </option>
          <option value="recepcionista">Recepcionista</option>
          <option value="coach">Coach</option>
        </select>
      </div>

      <div>
        <label htmlFor="usuario" className="mb-1 block text-sm font-medium">
          Usuario (handle de login)
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Contraseña inicial
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
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
        {pending ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}
