"use client";

import { useActionState } from "react";
import {
  restablecerPasswordAction,
  type RestablecerPasswordState,
} from "./actions";
import { btnSecondary, input, label, textoError, textoExito } from "@/lib/ui";

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
        <label htmlFor="password" className={label}>
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={6}
          required
          className={input}
        />
      </div>

      {state.error && <p className={textoError}>{state.error}</p>}
      {state.ok && <p className={textoExito}>Contraseña actualizada.</p>}

      <button type="submit" disabled={pending} className={`${btnSecondary} w-fit`}>
        {pending ? "Actualizando..." : "Restablecer contraseña"}
      </button>
    </form>
  );
}
