import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  btnPrimary,
  btnSecondary,
  card,
  input,
  linkAccion,
  linkVolver,
  pageTitle,
  tabla,
  tablaCell,
  tablaHeadCell,
  tablaHeadRow,
  tablaRow,
  tablaWrap,
  textoError,
} from "@/lib/ui";

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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link href="/" className={linkVolver}>
            ← Volver
          </Link>
          <h1 className={pageTitle}>Socios</h1>
        </div>
        <Link href="/socios/nuevo" className={btnPrimary}>
          + Socio nuevo
        </Link>
      </div>

      <form className="flex max-w-sm gap-2">
        <input
          type="text"
          name="dni"
          defaultValue={dniLimpio}
          placeholder="Buscar por DNI"
          className={input}
        />
        <button type="submit" className={btnSecondary}>
          Buscar
        </button>
      </form>

      {buscado && resultado && (
        <div className={card}>
          <p className="font-medium text-brand-text">{resultado.nombre}</p>
          <p className="text-sm text-brand-text-muted">DNI {resultado.dni}</p>
          <Link
            href={`/socios/${resultado.id}`}
            className={`${linkAccion} mt-2 inline-block`}
          >
            Ver ficha →
          </Link>
        </div>
      )}

      {buscado && !resultado && (
        <div className={card}>
          <p className="text-sm text-brand-text-muted">
            No se encontró ningún socio con DNI {dniLimpio}.
          </p>
          <Link
            href={`/socios/nuevo?dni=${encodeURIComponent(dniLimpio)}`}
            className={`${linkAccion} mt-2 inline-block`}
          >
            Cargar socio nuevo →
          </Link>
        </div>
      )}

      {error && <p className={textoError}>No se pudo cargar la lista: {error.message}</p>}

      <div className={tablaWrap}>
        <table className={tabla}>
          <thead>
            <tr className={tablaHeadRow}>
              <th className={tablaHeadCell}>Nombre</th>
              <th className={tablaHeadCell}>DNI</th>
              <th className={tablaHeadCell}>Teléfono</th>
              <th className={tablaHeadCell}></th>
            </tr>
          </thead>
          <tbody>
            {(socios ?? []).map((s) => (
              <tr key={s.id} className={tablaRow}>
                <td className={tablaCell}>{s.nombre}</td>
                <td className={tablaCell}>{s.dni}</td>
                <td className={tablaCell}>{s.telefono ?? "-"}</td>
                <td className={tablaCell}>
                  <Link href={`/socios/${s.id}`} className={linkAccion}>
                    Ver ficha
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {socios && socios.length === 0 && (
        <p className="text-sm text-brand-text-muted">
          Todavía no hay socios cargados.
        </p>
      )}
    </main>
  );
}
