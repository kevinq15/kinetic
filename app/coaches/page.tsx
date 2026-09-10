import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import CoachToggle from "./CoachToggle";

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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Disponibilidad de coaches</h1>
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Volver
      </Link>

      <p className="text-sm text-gray-600">
        Solo los coaches marcados como disponibles acá van a aparecer para
        elegir en la pantalla de ingreso. El Gerente siempre está
        disponible.
      </p>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-2 pr-4">Nombre</th>
            <th className="py-2 pr-4">Cargo</th>
            <th className="py-2">Disponibilidad</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((c) => (
            <tr key={c.coachId} className="border-b border-gray-100">
              <td className="py-2 pr-4">{c.nombre}</td>
              <td className="py-2 pr-4 capitalize">{c.cargo}</td>
              <td className="py-2">
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

      {lista.length === 0 && (
        <p className="text-sm text-gray-500">
          Todavía no hay coaches cargados.
        </p>
      )}
    </main>
  );
}
