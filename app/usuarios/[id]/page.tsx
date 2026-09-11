import { notFound } from "next/navigation";
import Link from "next/link";
import { requerirGerente } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import EditarUsuarioForm from "./EditarUsuarioForm";
import RestablecerPasswordForm from "./RestablecerPasswordForm";
import EstadoUsuario from "./EstadoUsuario";
import { badgeNeutral, badgeSuccess, card, linkVolver } from "@/lib/ui";

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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/usuarios" className={linkVolver}>
          ← Volver a usuarios
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-brand-text">
          {usuario.nombre}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-brand-text-muted">
          <span>Usuario: {usuario.usuario}</span>
          <span>·</span>
          <span className="capitalize">Cargo: {usuario.cargo}</span>
          <span className={usuario.activo ? badgeSuccess : badgeNeutral}>
            {usuario.activo ? "Activo" : "Dado de baja"}
          </span>
        </div>
      </div>

      <section className={`${card} flex flex-col gap-3`}>
        <h2 className="text-lg font-bold text-brand-text">Datos</h2>
        <EditarUsuarioForm usuario={usuario} />
      </section>

      <section className={`${card} flex flex-col gap-3`}>
        <h2 className="text-lg font-bold text-brand-text">Contraseña</h2>
        <RestablecerPasswordForm usuarioId={usuario.id} />
      </section>

      <section className={`${card} flex flex-col gap-3`}>
        <h2 className="text-lg font-bold text-brand-text">
          Estado de la cuenta
        </h2>
        <EstadoUsuario usuarioId={usuario.id} activo={usuario.activo} />
      </section>
    </main>
  );
}
