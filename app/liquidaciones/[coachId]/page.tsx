import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";
import { ayerArgentinaISO } from "@/lib/fecha";
import ConfirmarLiquidacionForm from "./ConfirmarLiquidacionForm";
import AnularLiquidacionForm from "./AnularLiquidacionForm";
import { alertError, alertWarning, btnSecondary, card, input, label, linkVolver, pageTitle } from "@/lib/ui";

type Periodo = {
  periodo_desde: string;
  periodo_hasta: string;
  cantidad: number;
};

type UltimaLiquidacion = {
  id: string;
  periodo_desde: string;
  periodo_hasta: string;
  cantidad_entrenamientos: number;
  monto_total: number;
  fecha_hora: string;
};

export default async function LiquidarCoachPage({
  params,
  searchParams,
}: {
  params: Promise<{ coachId: string }>;
  searchParams: Promise<{ fecha?: string }>;
}) {
  await requerirGerente();
  const { coachId } = await params;
  const { fecha } = await searchParams;

  const { data: coach } = await supabaseAdmin
    .from("coaches")
    .select("id, usuario_id, monto_por_entrenamiento")
    .eq("id", coachId)
    .maybeSingle();

  if (!coach) {
    notFound();
  }

  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("nombre, cargo, activo")
    .eq("id", coach.usuario_id)
    .maybeSingle();

  // RF-LIQ-07: el Gerente no se liquida — esta pantalla no es para él,
  // aunque alguien intente llegar acá escribiendo la URL a mano.
  if (!usuario || usuario.cargo !== "coach") {
    notFound();
  }

  // RF-LIQ-05: sin fecha de corte (el caso normal), se liquida hasta
  // este instante. La fecha de corte es opcional y solo tiene sentido
  // para un día anterior a hoy — nunca hoy, porque "hasta hoy" se
  // traduce a medianoche de HOY y se comería entrenamientos que todavía
  // no pasaron (ver la función en la base para el detalle del bug que
  // esto evita).
  const fechaCorte = fecha?.trim() || "";
  const maxFecha = ayerArgentinaISO();

  const { data: periodoData, error: periodoError } = await supabaseAdmin
    .rpc("calcular_periodo_liquidacion", {
      p_coach_id: coachId,
      p_fecha_corte: fechaCorte || null,
    })
    .single();
  const periodo = periodoData as Periodo | null;

  // RF-LIQ-09 / HU-16: solo la liquidación más reciente de este coach se
  // puede anular (la base lo revalida igual). Si existe, se ofrece acá.
  const { data: ultimaLiquidacion } = await supabaseAdmin
    .from("liquidaciones")
    .select(
      "id, periodo_desde, periodo_hasta, cantidad_entrenamientos, monto_total, fecha_hora"
    )
    .eq("coach_id", coachId)
    .eq("anulada", false)
    .order("periodo_hasta", { ascending: false })
    .limit(1)
    .maybeSingle();
  const liquidacion = ultimaLiquidacion as UltimaLiquidacion | null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/liquidaciones" className={linkVolver}>
          ← Volver a liquidaciones
        </Link>
        <h1 className={pageTitle}>
          Liquidar a {usuario.nombre}
        </h1>
      </div>

      {!usuario.activo && (
        <p className={alertWarning}>
          Este coach está dado de baja. Sigue apareciendo acá hasta que se
          le termine de pagar lo pendiente.
        </p>
      )}

      {liquidacion && (
        <section className={card}>
          <h2 className="mb-2 font-medium text-brand-text">
            Última liquidación
          </h2>
          <p className="text-sm text-brand-text">
            {liquidacion.cantidad_entrenamientos} entrenamiento(s) — $
            {liquidacion.monto_total.toFixed(2)} — pagada el{" "}
            {new Date(liquidacion.fecha_hora).toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
            })}
          </p>
          <p className="mt-1 text-xs text-brand-text-muted">
            Cubre hasta{" "}
            {new Date(liquidacion.periodo_hasta).toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
            })}
            . Si fue un error, se puede anular acá — se revierte el egreso
            de caja y sus entrenamientos vuelven a quedar pendientes.
          </p>
          <div className="mt-3">
            <AnularLiquidacionForm
              liquidacionId={liquidacion.id}
              coachId={coach.id}
            />
          </div>
        </section>
      )}

      {/* En columna hasta `sm:` — con el texto de ayuda adentro del
          mismo flex que el botón, "items-end" terminaba alineando el
          botón contra el párrafo de abajo en vez de contra el input, y
          en un celular angosto además quedaba todo apretado. */}
      <form className="flex max-w-sm flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <label htmlFor="fecha" className={label}>
            Fecha de corte (opcional)
          </label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            max={maxFecha}
            defaultValue={fechaCorte}
            className={input}
          />
        </div>
        <button
          type="submit"
          className={`${btnSecondary} w-full sm:mt-6 sm:w-auto`}
        >
          Recalcular
        </button>
      </form>
      <p className="max-w-sm text-xs text-brand-text-muted">
        Vacío = liquidar hasta ahora mismo. Completalo solo si querés dejar
        afuera, a propósito, los entrenamientos de hoy.
      </p>

      {periodoError && <p className={alertError}>{periodoError.message}</p>}

      {periodo && (
        <div className={card}>
          <p className="text-sm text-brand-text">
            Período: desde{" "}
            {new Date(periodo.periodo_desde).toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
            })}{" "}
            hasta{" "}
            {new Date(periodo.periodo_hasta).toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
            })}
          </p>
          <p className="mt-1 font-medium text-brand-text">
            Entrenamientos en el período: {periodo.cantidad}
          </p>
        </div>
      )}

      {periodo && periodo.cantidad > 0 && (
        <ConfirmarLiquidacionForm
          coachId={coach.id}
          fechaCorte={fechaCorte}
          montoSugerido={coach.monto_por_entrenamiento}
          cantidad={periodo.cantidad}
        />
      )}

      {periodo && periodo.cantidad === 0 && (
        <p className="text-sm text-brand-text-muted">
          No hay entrenamientos pendientes en ese período.
        </p>
      )}
    </main>
  );
}
