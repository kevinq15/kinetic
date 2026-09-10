import { notFound } from "next/navigation";
import Link from "next/link";
import { requerirGerente } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import EditarUsuarioForm from "./EditarUsuarioForm";
import RestablecerPasswordForm from "./RestablecerPasswordForm";
import EstadoUsuario from "./EstadoUsuario";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requerirGerente();
  const { id } = await params;

  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("id, nombre, dni, mail, usuario, cargo, activo")
    .eq("id", id)
    .maybeSingle();

  if (!usuario) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 p-6">
      <Link href="/usuarios" className="text-sm text-gray-500 hover:underline">
        ← Volver a usuarios
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{usuario.nombre}</h1>
        <p className="text-sm text-gray-500">
          Usuario: {usuario.usuario} · Cargo:{" "}
          <span className="capitalize">{usuario.cargo}</span> ·{" "}
          {usuario.activo ? "Activo" : "Dado de baja"}
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Datos</h2>
        <EditarUsuarioForm usuario={usuario} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Contraseña</h2>
        <RestablecerPasswordForm usuarioId={usuario.id} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Estado de la cuenta</h2>
        <EstadoUsuario usuarioId={usuario.id} activo={usuario.activo} />
      </section>
    </main>
  );
}
