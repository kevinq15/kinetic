import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import CoachToggle from "./CoachToggle";
import {
  linkVolver,
  pageTitle,
  tabla,
  tablaCell,
  tablaHeadCell,
  tablaHeadRow,
  tablaRow,
  tablaWrap,
} from "@/lib/ui";

type Coach = {
  coachId: string;
  nombre: string;
  cargo: "gerente" | "coach";
  disponible: boolean;
};

export default async function CoachesPage() {
  // RF-USR-03: solo Coach (+ Gerente) son seleccionables en el ingreso.
  // RF-USR-07: un usuario dado de baja desaparece de esta lista.
  const { data: usuarios } = await supabaseAdmin
    .from("usuarios")
    .select("id, nombre, cargo")
    .in("cargo", ["coach", "gerente"])
    .eq("activo", true)
    .order("nombre", { ascending: true });

  const usuarioIds = (usuarios ?? []).map((u) => u.id);

  // Consulta en dos pasos (usuarios, después coaches) en vez de un join
  // anidado, mismo motivo que en /socios/[id]: no tenemos tipos
  // generados de Supabase en este proyecto.
  const { data: coaches } =
    usuarioIds.length > 0
      ? await supabaseAdmin
          .from("coaches")
          .select("id, usuario_id, disponible")
          .in("usuario_id", usuarioIds)
      : { data: [] as { id: string; usuario_id: string; disponible: boolean }[] };

  const lista: Coach[] = (usuarios ?? []).flatMap((u) => {
    const coach = (coaches ?? []).find((c) => c.usuario_id === u.id);
    if (!coach) return [];
    return [
      {
        coachId: coach.id,
        nombre: u.nombre,
        cargo: u.cargo as "gerente" | "coach",
        disponible: coach.disponible,
      },
    ];
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/" className={linkVolver}>
          ← Volver
        </Link>
        <h1 className={pageTitle}>
          Disponibilidad de coaches
        </h1>
      </div>

      <p className="text-sm text-brand-text-muted">
        Solo los coaches marcados como disponibles acá van a aparecer para
        elegir en la pantalla de ingreso. El Gerente siempre está
        disponible.
      </p>

      <div className={tablaWrap}>
        <table className={tabla}>
          <thead>
            <tr className={tablaHeadRow}>
              <th className={tablaHeadCell}>Nombre</th>
              <th className={tablaHeadCell}>Cargo</th>
              <th className={tablaHeadCell}>Disponibilidad</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((c) => (
              <tr key={c.coachId} className={tablaRow}>
                <td className={tablaCell}>{c.nombre}</td>
                <td className={`${tablaCell} capitalize`}>{c.cargo}</td>
                <td className={tablaCell}>
                  <CoachToggle
                    coachId={c.coachId}
                    disponible={c.disponible}
                    esGerente={c.cargo === "gerente"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lista.length === 0 && (
        <p className="text-sm text-brand-text-muted">
          Todavía no hay coaches cargados.
        </p>
      )}
    </main>
  );
}
