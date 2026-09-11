import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";
import {
  linkAccion,
  linkVolver,
  pageTitle,
  tabla,
  tablaCell,
  tablaHeadCell,
  tablaHeadRow,
  tablaRow,
  tablaWrap,
} from "@/lib/ui";

type Pendiente = { cantidad: number; monto: number };

type Fila = {
  coachId: string;
  nombre: string;
  activo: boolean;
  cantidadPendiente: number;
};

export default async function LiquidacionesPage() {
  await requerirGerente();

  // RF-LIQ-07: el Gerente nunca aparece en esta pantalla, aunque también
  // entrena y acumula entrenamientos (son solo informativos para él).
  const { data: usuariosCoach } = await supabaseAdmin
    .from("usuarios")
    .select("id, nombre, activo")
    .eq("cargo", "coach")
    .order("nombre", { ascending: true });

  const usuarioIds = (usuariosCoach ?? []).map((u) => u.id);
  const { data: coachesRows } =
    usuarioIds.length > 0
      ? await supabaseAdmin
          .from("coaches")
          .select("id, usuario_id")
          .in("usuario_id", usuarioIds)
      : { data: [] as { id: string; usuario_id: string }[] };

  const filas: Fila[] = [];
  for (const u of usuariosCoach ?? []) {
    const coach = (coachesRows ?? []).find((c) => c.usuario_id === u.id);
    if (!coach) continue;

    const { data } = await supabaseAdmin
      .rpc("entrenamientos_pendientes", { p_coach_id: coach.id })
      .single();
    const pendiente = data as Pendiente | null;
    const cantidad = pendiente?.cantidad ?? 0;

    // RF-LIQ-08: un coach dado de baja solo sigue apareciendo acá
    // mientras tenga entrenamientos sin liquidar.
    if (!u.activo && cantidad === 0) continue;

    filas.push({
      coachId: coach.id,
      nombre: u.nombre,
      activo: u.activo,
      cantidadPendiente: cantidad,
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/" className={linkVolver}>
          ← Volver
        </Link>
        <h1 className={pageTitle}>
          Liquidaciones
        </h1>
      </div>

      <div className={tablaWrap}>
        <table className={tabla}>
          <thead>
            <tr className={tablaHeadRow}>
              <th className={tablaHeadCell}>Coach</th>
              <th className={tablaHeadCell}>Entrenamientos pendientes</th>
              <th className={tablaHeadCell}></th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.coachId} className={tablaRow}>
                <td className={tablaCell}>
                  {f.nombre}
                  {!f.activo && (
                    <span className="ml-2 rounded-full border border-amber-900/60 bg-amber-950/40 px-2 py-0.5 text-xs font-medium text-amber-300">
                      dado de baja
                    </span>
                  )}
                </td>
                <td className={tablaCell}>{f.cantidadPendiente}</td>
                <td className={tablaCell}>
                  {/* Siempre hay que poder entrar a esta pantalla, aunque
                      no haya nada pendiente: es donde está el botón para
                      anular la última liquidación (RF-LIQ-09 / HU-16), y
                      sin nada pendiente ese coach no tenía otra forma de
                      llegar ahí (bug reportado al probar HU-16). */}
                  <Link href={`/liquidaciones/${f.coachId}`} className={linkAccion}>
                    {f.cantidadPendiente > 0 ? "Liquidar →" : "Ver →"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filas.length === 0 && (
        <p className="text-sm text-brand-text-muted">
          Todavía no hay coaches cargados.
        </p>
      )}
    </main>
  );
}
