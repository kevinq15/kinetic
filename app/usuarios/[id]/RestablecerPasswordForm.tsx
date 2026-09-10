"use client";

import { useActionState } from "react";
import {
  restablecerPasswordAction,
  type RestablecerPasswordState,
} from "./actions";

const estadoInicial: RestablecerPasswordState = { error: null };

export default function RestablecerPasswordForm({
  usuarioId,
}: {
  usuarioId: string;
}) {
  const [state, formAction, pending] = useActionState(
    restablecerPasswordAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <input type="hidden" name="id" value={usuarioId} />
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={6}
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && (
        <p className="text-sm text-green-700">Contraseña actualizada.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
      >
        {pending ? "Actualizando..." : "Restablecer contraseña"}
      </button>
    </form>
  );
}
