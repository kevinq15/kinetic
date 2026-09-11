import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";
import EgresoForm from "./EgresoForm";
import {
  card,
  linkVolver,
  pageTitle,
  tabla,
  tablaCell,
  tablaHeadCell,
  tablaHeadRow,
  tablaRow,
  tablaWrap,
} from "@/lib/ui";

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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/" className={linkVolver}>
          ← Volver
        </Link>
        <h1 className={pageTitle}>Caja</h1>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className={card}>
          <p className="text-sm text-brand-text-muted">Saldo actual</p>
          <p className="text-2xl font-semibold text-brand-primary">
            ${saldoNumero.toFixed(2)}
          </p>
        </div>

        {desglose.map((d) => (
          <div key={d.medio_pago} className={card}>
            <p className="text-sm text-brand-text-muted">
              {NOMBRE_MEDIO[d.medio_pago] ?? d.medio_pago}
            </p>
            <p className="text-lg font-medium text-brand-text">
              ${d.total.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-brand-text">
          Registrar egreso
        </h2>
        <p className="text-sm text-brand-text-muted">
          Para cualquier gasto que no sea una venta ni una liquidación — por
          ejemplo, el pago a un Recepcionista, que no pasa por el módulo de
          liquidaciones porque no tiene perfil de coach.
        </p>
        <EgresoForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-brand-text">
          Historial de movimientos
        </h2>
        <div className={tablaWrap}>
          <table className={tabla}>
            <thead>
              <tr className={tablaHeadRow}>
                <th className={tablaHeadCell}>Fecha</th>
                <th className={tablaHeadCell}>Tipo</th>
                <th className={tablaHeadCell}>Monto</th>
                <th className={tablaHeadCell}>Motivo</th>
                <th className={tablaHeadCell}>Medio de pago</th>
                <th className={tablaHeadCell}>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => {
                const anulado = idsRevertidos.has(m.id);
                const esReversion = m.revierte_a !== null;
                const textoTachado = anulado
                  ? "text-brand-text-muted line-through"
                  : "";

                return (
                  <tr
                    key={m.id}
                    className={
                      tablaRow + (esReversion ? " bg-amber-950/20" : "")
                    }
                  >
                    <td
                      className={`${tablaCell} whitespace-nowrap ${textoTachado}`}
                    >
                      {new Date(m.fecha_hora).toLocaleString("es-AR", {
                        timeZone: "America/Argentina/Buenos_Aires",
                      })}
                    </td>
                    <td className={tablaCell}>
                      <span
                        className={
                          (m.tipo === "ingreso"
                            ? "text-green-400"
                            : "text-red-400") +
                          (anulado ? " text-brand-text-muted line-through" : "")
                        }
                      >
                        {m.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                      </span>
                      {anulado && (
                        <span className="ml-2 rounded-full border border-brand-border bg-brand-surface-2 px-2 py-0.5 text-xs font-medium text-brand-text-muted">
                          Anulado
                        </span>
                      )}
                      {esReversion && (
                        <span className="ml-2 rounded-full border border-amber-900/60 bg-amber-950/40 px-2 py-0.5 text-xs font-medium text-amber-300">
                          Reversión
                        </span>
                      )}
                    </td>
                    <td className={`${tablaCell} ${textoTachado}`}>
                      ${m.monto.toFixed(2)}
                    </td>
                    <td className={`${tablaCell} ${textoTachado}`}>
                      {m.motivo}
                    </td>
                    <td className={tablaCell}>
                      {m.medio_pago
                        ? NOMBRE_MEDIO[m.medio_pago] ?? m.medio_pago
                        : "-"}
                    </td>
                    <td className={tablaCell}>
                      {nombrePorUsuario.get(m.usuario_id) ?? "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {movimientos.length === 0 && (
          <p className="text-sm text-brand-text-muted">
            Todavía no hay movimientos de caja.
          </p>
        )}
      </section>
    </main>
  );
}
