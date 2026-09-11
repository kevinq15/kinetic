"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { btnPrimaryLg, input, label, textoError } from "@/lib/ui";
import { BarbellSpinner } from "@/components/Spinner";

const estadoInicial: LoginState = { error: null };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div>
        <label htmlFor="usuario" className={label}>
          Usuario
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          autoComplete="username"
          required
          className={input}
        />
      </div>

      <div>
        <label htmlFor="password" className={label}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={input}
        />
      </div>

      {state.error && (
        <p className={textoError} role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btnPrimaryLg} mt-1 w-full`}>
        {pending ? (
          <>
            <BarbellSpinner className="h-4 w-4" />
            Ingresando...
          </>
        ) : (
          "Ingresar"
        )}
      </button>
    </form>
  );
}
