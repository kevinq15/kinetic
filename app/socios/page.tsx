import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function SociosPage({
  searchParams,
}: {
  searchParams: Promise<{ dni?: string }>;
}) {
  const { dni } = await searchParams;
  const dniLimpio = dni?.trim() ?? "";

  let resultado: { id: string; nombre: string; dni: string } | null = null;
  let buscado = false;

  if (dniLimpio) {
    buscado = true;
    const { data } = await supabaseAdmin
      .from("socios")
      .select("id, nombre, dni")
      .eq("dni", dniLimpio)
      .maybeSingle();
    resultado = data;
  }

  const { data: socios, error } = await supabaseAdmin
    .from("socios")
    .select("id, nombre, dni, telefono")
    .order("nombre", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Socios</h1>
        <Link
          href="/socios/nuevo"
          className="rounded bg-black px-4 py-2 font-medium text-white"
        >
          + Socio nuevo
        </Link>
      </div>

      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Volver
      </Link>

      <form className="flex max-w-sm gap-2">
        <input
          type="text"
          name="dni"
          defaultValue={dniLimpio}
          placeholder="Buscar por DNI"
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
        >
          Buscar
        </button>
      </form>

      {buscado && resultado && (
        <div className="rounded border border-gray-200 p-4">
          <p className="font-medium">{resultado.nombre}</p>
          <p className="text-sm text-gray-500">DNI {resultado.dni}</p>
          <Link
            href={`/socios/${resultado.id}`}
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            Ver ficha →
          </Link>
        </div>
      )}

      {buscado && !resultado && (
        <div className="rounded border border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            No se encontró ningún socio con DNI {dniLimpio}.
          </p>
          <Link
            href={`/socios/nuevo?dni=${encodeURIComponent(dniLimpio)}`}
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            Cargar socio nuevo →
          </Link>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">
          No se pudo cargar la lista: {error.message}
        </p>
      )}

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-2 pr-4">Nombre</th>
            <th className="py-2 pr-4">DNI</th>
            <th className="py-2 pr-4">Teléfono</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {(socios ?? []).map((s) => (
            <tr key={s.id} className="border-b border-gray-100">
              <td className="py-2 pr-4">{s.nombre}</td>
              <td className="py-2 pr-4">{s.dni}</td>
              <td className="py-2 pr-4">{s.telefono ?? "-"}</td>
              <td className="py-2">
                <Link
                  href={`/socios/${s.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Ver ficha
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {socios && socios.length === 0 && (
        <p className="text-sm text-gray-500">
          Todavía no hay socios cargados.
        </p>
      )}
    </main>
  );
}
