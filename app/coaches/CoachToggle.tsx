"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  cambiarDisponibilidadAction,
  type DisponibilidadState,
} from "./actions";
import { btnPrimary, btnSecondary, textoError } from "@/lib/ui";

const estadoInicial: DisponibilidadState = { error: null };

export default function CoachToggle({
  coachId,
  disponible,
  esGerente,
}: {
  coachId: string;
  disponible: boolean;
  esGerente: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    cambiarDisponibilidadAction,
    estadoInicial
  );
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      // Refresca los datos del Server Component (la lista de coaches).
      router.refresh();
    }
  }, [state.ok, router]);

  if (esGerente) {
    return (
      <span className="text-sm text-brand-text-muted">
        Siempre disponible
      </span>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <input type="hidden" name="id" value={coachId} />
      <input
        type="hidden"
        name="nuevo_estado"
        value={disponible ? "false" : "true"}
      />
      <button
        type="submit"
        disabled={pending}
        className={disponible ? btnSecondary : btnPrimary}
      >
        {pending
          ? "Guardando..."
          : disponible
            ? "Marcar no disponible"
            : "Marcar disponible"}
      </button>
      {state.error && <p className={textoError}>{state.error}</p>}
    </form>
  );
}
