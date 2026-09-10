import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";
import EgresoForm from "./EgresoForm";

type Desglose = { medio_pago: string; total: number };

type Movimiento = {
  id: string;
  tipo: "ingreso" | "egreso";
  monto: number;
  motivo: string;
  medio_pago: string | null;
  fecha_hora: string;
  usuario_id: string;
  revierte_a: string | null;
};

const NOMBRE_MEDIO: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
};

export default async function CajaPage() {
  await requerirGerente();

  // RF-CAJ-06: saldo actual.
  const { data: saldo } = await supabaseAdmin.rpc("saldo_caja");
  const saldoNumero = (saldo as number | null) ?? 0;

  // RF-CAJ-04: cuánto entró por cada medio de pago.
  const { data: desgloseData } = await supabaseAdmin.rpc(
    "ingresos_por_medio_pago"
  );
  const desglose = (desgloseData as Desglose[] | null) ?? [];

  // RF-CAJ-01/04: historial completo (los últimos 200 movimientos).
  const { data: movimientosData } = await supabaseAdmin
    .from("movimientos_caja")
    .select(
      "id, tipo, monto, motivo, medio_pago, fecha_hora, usuario_id, revierte_a"
    )
    .order("fecha_hora", { ascending: false })
    .limit(200);
  const movimientos = (movimientosData ?? []) as Movimiento[];

  // RF-CAJ-05: un movimiento anulado nunca se borra ni se edita — queda
  // marcado acá por ser el objetivo del revierte_a de otro. El historial
  // tiene que distinguirlos visualmente de un movimiento común, para que
  // no parezca que la caja tiene ese dinero cuando en realidad ya se
  // revirtió.
  const idsRevertidos = new Set(
    movimientos
      .filter((m) => m.revierte_a !== null)
      .map((m) => m.revierte_a as string)
  );

  const usuarioIds = [...new Set(movimientos.map((m) => m.usuario_id))];
  const { data: usuariosData } =
    usuarioIds.length > 0
      ? await supabaseAdmin
          .from("usuarios")
          .select("id, nombre")
          .in("id", usuarioIds)
      : { data: [] as { id: string; nombre: string }[] };
  const nombrePorUsuario = new Map(
    (usuariosData ?? []).map((u) => [u.id, u.nombre])
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Caja</h1>
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          ← Volver
        </Link>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="rounded border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Saldo actual</p>
          <p className="text-2xl font-semibold">${saldoNumero.toFixed(2)}</p>
        </div>

        {desglose.map((d) => (
          <div key={d.medio_pago} className="rounded border border-gray-200 p-4">
            <p className="text-sm text-gray-500">
              {NOMBRE_MEDIO[d.medio_pago] ?? d.medio_pago}
            </p>
            <p className="text-lg font-medium">${d.total.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Registrar egreso</h2>
        <p className="text-sm text-gray-600">
          Para cualquier gasto que no sea una venta ni una liquidación — por
          ejemplo, el pago a un Recepcionista, que no pasa por el módulo de
          liquidaciones porque no tiene perfil de coach.
        </p>
        <EgresoForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Historial de movimientos</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Monto</th>
                <th className="py-2 pr-4">Motivo</th>
                <th className="py-2 pr-4">Medio de pago</th>
                <th className="py-2">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => {
                const anulado = idsRevertidos.has(m.id);
                const esReversion = m.revierte_a !== null;
                const textoTachado = anulado ? "text-gray-400 line-through" : "";

                return (
                  <tr
                    key={m.id}
                    className={
                      "border-b border-gray-100" +
                      (esReversion ? " bg-amber-50" : "")
                    }
                  >
                    <td className={`py-2 pr-4 whitespace-nowrap ${textoTachado}`}>
                      {new Date(m.fecha_hora).toLocaleString("es-AR", {
                        timeZone: "America/Argentina/Buenos_Aires",
                      })}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          (m.tipo === "ingreso"
                            ? "text-green-700"
                            : "text-red-700") +
                          (anulado ? " text-gray-400 line-through" : "")
                        }
                      >
                        {m.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                      </span>
                      {anulado && (
                        <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                          Anulado
                        </span>
                      )}
                      {esReversion && (
                        <span className="ml-2 rounded bg-amber-200 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                          Reversión
                        </span>
                      )}
                    </td>
                    <td className={`py-2 pr-4 ${textoTachado}`}>
                      ${m.monto.toFixed(2)}
                    </td>
                    <td className={`py-2 pr-4 ${textoTachado}`}>{m.motivo}</td>
                    <td className="py-2 pr-4">
                      {m.medio_pago
                        ? NOMBRE_MEDIO[m.medio_pago] ?? m.medio_pago
                        : "-"}
                    </td>
                    <td className="py-2">
                      {nombrePorUsuario.get(m.usuario_id) ?? "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {movimientos.length === 0 && (
          <p className="text-sm text-gray-500">
            Todavía no hay movimientos de caja.
          </p>
        )}
      </section>
    </main>
  );
}
