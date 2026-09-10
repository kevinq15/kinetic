import Link from "next/link";
import { requerirGerente } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function UsuariosPage() {
  await requerirGerente();

  const { data: usuarios, error } = await supabaseAdmin
    .from("usuarios")
    .select("id, nombre, usuario, cargo, activo")
    .order("nombre", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuarios internos</h1>
        <Link
          href="/usuarios/nuevo"
          className="rounded bg-black px-4 py-2 font-medium text-white"
        >
          + Crear usuario
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
            <th className="py-2">Usuario</th>
            <th className="py-2">Cargo</th>
            <th className="py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {(usuarios ?? []).map((u) => (
            <tr key={u.id} className="border-b border-gray-100">
              <td className="py-2">{u.nombre}</td>
              <td className="py-2">{u.usuario}</td>
              <td className="py-2 capitalize">{u.cargo}</td>
              <td className="py-2">{u.activo ? "Activo" : "Dado de baja"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {usuarios && usuarios.length === 0 && (
        <p className="text-sm text-gray-500">Todavía no hay usuarios cargados.</p>
      )}
    </main>
  );
}
