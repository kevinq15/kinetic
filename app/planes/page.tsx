import Link from "next/link";
import { requerirGerente } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function PlanesPage() {
  await requerirGerente();

  const { data: planes, error } = await supabaseAdmin
    .from("planes")
    .select("id, nombre, cantidad_pases, duracion_dias, precio, activo")
    .order("nombre", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Catálogo de planes</h1>
        <Link
          href="/planes/nuevo"
          className="rounded bg-black px-4 py-2 font-medium text-white"
        >
          + Crear plan
        </Link>
      </div>

      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Volver
      </Link>

      {error && (
        <p className="text-sm text-red-600">
          No se pudo cargar la lista: {error.message}
        </p>
      )}

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-2">Nombre</th>
            <th className="py-2">Pases</th>
            <th className="py-2">Duración</th>
            <th className="py-2">Precio</th>
            <th className="py-2">Estado</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {(planes ?? []).map((p) => (
            <tr key={p.id} className="border-b border-gray-100">
              <td className="py-2">{p.nombre}</td>
              <td className="py-2">{p.cantidad_pases}</td>
              <td className="py-2">{p.duracion_dias} días</td>
              <td className="py-2">${p.precio}</td>
              <td className="py-2">{p.activo ? "Activo" : "Dado de baja"}</td>
              <td className="py-2">
                <Link
                  href={`/planes/${p.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {planes && planes.length === 0 && (
        <p className="text-sm text-gray-500">
          Todavía no hay planes cargados.
        </p>
      )}
    </main>
  );
}
