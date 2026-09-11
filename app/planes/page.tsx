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

export default async function PlanesPage() {
  await requerirGerente();

  const { data: planes, error } = await supabaseAdmin
    .from("planes")
    .select("id, nombre, cantidad_pases, duracion_dias, precio, activo")
    .order("nombre", { ascending: true });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/" className={linkVolver}>
          ← Volver
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className={pageTitle}>Catálogo de planes</h1>
          <Link href="/planes/nuevo" className={btnPrimary}>
            + Crear plan
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
              <th className={tablaHeadCell}>Pases</th>
              <th className={tablaHeadCell}>Duración</th>
              <th className={tablaHeadCell}>Precio</th>
              <th className={tablaHeadCell}>Estado</th>
              <th className={tablaHeadCell}></th>
            </tr>
          </thead>
          <tbody>
            {(planes ?? []).map((p) => (
              <tr key={p.id} className={tablaRow}>
                <td className={tablaCell}>{p.nombre}</td>
                <td className={tablaCell}>{p.cantidad_pases}</td>
                <td className={tablaCell}>{p.duracion_dias} días</td>
                <td className={tablaCell}>${p.precio}</td>
                <td className={tablaCell}>
                  <span className={p.activo ? badgeSuccess : badgeNeutral}>
                    {p.activo ? "Activo" : "Dado de baja"}
                  </span>
                </td>
                <td className={tablaCell}>
                  <Link href={`/planes/${p.id}`} className={linkAccion}>
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {planes && planes.length === 0 && (
        <p className="text-sm text-brand-text-muted">
          Todavía no hay planes cargados.
        </p>
      )}
    </main>
  );
}
