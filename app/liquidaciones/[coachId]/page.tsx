import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";
import { ayerArgentinaISO } from "@/lib/fecha";
import ConfirmarLiquidacionForm from "./ConfirmarLiquidacionForm";

type Periodo = {
  periodo_desde: string;
  periodo_hasta: string;
  cantidad: number;
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

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Liquidar a {usuario.nombre}</h1>
      <Link
        href="/liquidaciones"
        className="text-sm text-gray-500 hover:underline"
      >
        ← Volver a liquidaciones
      </Link>

      {!usuario.activo && (
        <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Este coach está dado de baja. Sigue apareciendo acá hasta que se
          le termine de pagar lo pendiente.
        </p>
      )}

      <form className="flex max-w-sm items-end gap-2">
        <div className="flex-1">
          <label htmlFor="fecha" className="mb-1 block text-sm font-medium">
            Fecha de corte (opcional)
          </label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            max={maxFecha}
            defaultValue={fechaCorte}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Vacío = liquidar hasta ahora mismo. Completalo solo si querés
            dejar afuera, a propósito, los entrenamientos de hoy.
          </p>
        </div>
        <button
          type="submit"
          className="rounded border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
        >
          Recalcular
        </button>
      </form>

      {periodoError && (
        <p className="text-sm text-red-600">{periodoError.message}</p>
      )}

      {periodo && (
        <div className="rounded border border-gray-200 p-4 text-sm">
          <p>
            Período: desde{" "}
            {new Date(periodo.periodo_desde).toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
            })}{" "}
            hasta{" "}
            {new Date(periodo.periodo_hasta).toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
            })}
          </p>
          <p className="mt-1 font-medium">
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
        <p className="text-sm text-gray-500">
          No hay entrenamientos pendientes en ese período.
        </p>
      )}
    </main>
  );
}
