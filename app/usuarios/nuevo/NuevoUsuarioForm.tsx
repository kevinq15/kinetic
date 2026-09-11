"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { crearUsuarioAction, type CrearUsuarioState } from "../actions";
import { btnPrimary, input, label, select, textoError } from "@/lib/ui";

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
        <label htmlFor="nombre" className={label}>
          Nombre completo
        </label>
        <input id="nombre" name="nombre" type="text" required className={input} />
      </div>

      <div>
        <label htmlFor="dni" className={label}>
          DNI
        </label>
        <input id="dni" name="dni" type="text" required className={input} />
      </div>

      <div>
        <label htmlFor="mail" className={label}>
          Mail (opcional)
        </label>
        <input id="mail" name="mail" type="email" className={input} />
      </div>

      <div>
        <label htmlFor="cargo" className={label}>
          Cargo
        </label>
        <select id="cargo" name="cargo" required defaultValue="" className={select}>
          <option value="" disabled>
            Elegir...
          </option>
          <option value="recepcionista">Recepcionista</option>
          <option value="coach">Coach</option>
        </select>
      </div>

      <div>
        <label htmlFor="usuario" className={label}>
          Usuario (handle de login)
        </label>
        <input id="usuario" name="usuario" type="text" required className={input} />
      </div>

      <div>
        <label htmlFor="password" className={label}>
          Contraseña inicial
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className={input}
        />
      </div>

      {state.error && (
        <p className={textoError} role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}
