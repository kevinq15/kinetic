import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";
import EgresoForm from "./EgresoForm";

export default async function EgresoPage() {
  await requerirGerente();

  // RF-CAJ-06: mostrar el saldo actual acá, para que el Gerente sepa
  // cuánto hay disponible antes de confirmar un egreso.
  const { data: saldo } = await supabaseAdmin.rpc("saldo_caja");
  const saldoNumero = (saldo as number | null) ?? 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Registrar egreso</h1>
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Volver
      </Link>

      <div className="rounded border border-gray-200 p-4">
        <p className="text-sm text-gray-500">Saldo actual de caja</p>
        <p className="text-2xl font-semibold">${saldoNumero.toFixed(2)}</p>
      </div>

      <p className="text-sm text-gray-600">
        Para cualquier gasto que no sea una venta ni una liquidación — por
        ejemplo, el pago a un Recepcionista, que no pasa por el módulo de
        liquidaciones porque no tiene perfil de coach.
      </p>

      <EgresoForm />
    </main>
  );
}
