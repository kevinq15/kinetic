import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requerirGerente } from "@/lib/session";

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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Liquidaciones</h1>
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Volver
      </Link>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-2 pr-4">Coach</th>
            <th className="py-2 pr-4">Entrenamientos pendientes</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.coachId} className="border-b border-gray-100">
              <td className="py-2 pr-4">
                {f.nombre}
                {!f.activo && (
                  <span className="ml-2 text-xs text-amber-700">
                    (dado de baja)
                  </span>
                )}
              </td>
              <td className="py-2 pr-4">{f.cantidadPendiente}</td>
              <td className="py-2">
                {/* Siempre hay que poder entrar a esta pantalla, aunque
                    no haya nada pendiente: es donde está el botón para
                    anular la última liquidación (RF-LIQ-09 / HU-16), y
                    sin nada pendiente ese coach no tenía otra forma de
                    llegar ahí (bug reportado al probar HU-16). */}
                <Link
                  href={`/liquidaciones/${f.coachId}`}
                  className="text-blue-600 hover:underline"
                >
                  {f.cantidadPendiente > 0 ? "Liquidar →" : "Ver →"}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filas.length === 0 && (
        <p className="text-sm text-gray-500">
          Todavía no hay coaches cargados.
        </p>
      )}
    </main>
  );
}
