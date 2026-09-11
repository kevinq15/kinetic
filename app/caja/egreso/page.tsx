import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";
import EgresoForm from "./EgresoForm";
import { card, linkVolver, pageTitle } from "@/lib/ui";

export default async function EgresoPage() {
  await requerirGerente();

  // RF-CAJ-06: mostrar el saldo actual acá, para que el Gerente sepa
  // cuánto hay disponible antes de confirmar un egreso.
  const { data: saldo } = await supabaseAdmin.rpc("saldo_caja");
  const saldoNumero = (saldo as number | null) ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/" className={linkVolver}>
          ← Volver
        </Link>
        <h1 className={pageTitle}>
          Registrar egreso
        </h1>
      </div>

      <div className={card}>
        <p className="text-sm text-brand-text-muted">Saldo actual de caja</p>
        <p className="text-2xl font-semibold text-brand-primary">
          ${saldoNumero.toFixed(2)}
        </p>
      </div>

      <p className="text-sm text-brand-text-muted">
        Para cualquier gasto que no sea una venta ni una liquidación — por
        ejemplo, el pago a un Recepcionista, que no pasa por el módulo de
        liquidaciones porque no tiene perfil de coach.
      </p>

      <EgresoForm />
    </main>
  );
}
