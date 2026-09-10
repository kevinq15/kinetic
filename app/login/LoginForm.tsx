"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const estadoInicial: LoginState = { error: null };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div>
        <label htmlFor="usuario" className="mb-1 block text-sm font-medium">
          Usuario
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          autoComplete="username"
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
