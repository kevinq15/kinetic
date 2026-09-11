import Link from "next/link";
import { requerirGerente } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  alertError,
  badgeNeutral,
  badgeSuccess,
  btnPrimary,
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

export default async function UsuariosPage() {
  await requerirGerente();

  const { data: usuarios, error } = await supabaseAdmin
    .from("usuarios")
    .select("id, nombre, usuario, cargo, activo")
    .order("nombre", { ascending: true });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/" className={linkVolver}>
          ← Volver
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className={pageTitle}>Usuarios internos</h1>
          <Link href="/usuarios/nuevo" className={btnPrimary}>
            + Crear usuario
          </Link>
        </div>
      </div>

      {error && (
        <p className={alertError}>No se pudo cargar la lista: {error.message}</p>
      )}

      <div className={tablaWrap}>
        <table className={tabla}>
          <thead>
            <tr className={tablaHeadRow}>
              <th className={tablaHeadCell}>Nombre</th>
              <th className={tablaHeadCell}>Usuario</th>
              <th className={tablaHeadCell}>Cargo</th>
              <th className={tablaHeadCell}>Estado</th>
              <th className={tablaHeadCell}></th>
            </tr>
          </thead>
          <tbody>
            {(usuarios ?? []).map((u) => (
              <tr key={u.id} className={tablaRow}>
                <td className={tablaCell}>{u.nombre}</td>
                <td className={tablaCell}>{u.usuario}</td>
                <td className={`${tablaCell} capitalize`}>{u.cargo}</td>
                <td className={tablaCell}>
                  <span className={u.activo ? badgeSuccess : badgeNeutral}>
                    {u.activo ? "Activo" : "Dado de baja"}
                  </span>
                </td>
                <td className={tablaCell}>
                  <Link href={`/usuarios/${u.id}`} className={linkAccion}>
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {usuarios && usuarios.length === 0 && (
        <p className="text-sm text-brand-text-muted">
          Todavía no hay usuarios cargados.
        </p>
      )}
    </main>
  );
}
