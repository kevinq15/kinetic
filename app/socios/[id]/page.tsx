import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { obtenerSesion } from "@/lib/session";
import EditarSocioForm from "./EditarSocioForm";
import AnularVentaForm from "./AnularVentaForm";
import { btnPrimary, card, linkVolver, pageTitle } from "@/lib/ui";

export default async function SocioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sesion = await obtenerSesion();

  const { data: socio } = await supabaseAdmin
    .from("socios")
    .select(
      "id, dni, nombre, fecha_nacimiento, telefono, email, telefono_emergencia, observaciones"
    )
    .eq("id", id)
    .maybeSingle();

  if (!socio) {
    notFound();
  }

  // Plan actual: consulta simple en dos pasos (venta activa, y su plan),
  // en vez de un join anidado, para no depender de tipos generados de
  // Supabase que no tenemos configurados en este proyecto.
  const { data: ventaActiva } = await supabaseAdmin
    .from("ventas")
    .select("id, plan_id, pases_restantes, fecha_vencimiento")
    .eq("socio_id", id)
    .eq("activa", true)
    .maybeSingle();

  let nombrePlan: string | null = null;
  if (ventaActiva) {
    const { data: plan } = await supabaseAdmin
      .from("planes")
      .select("nombre")
      .eq("id", ventaActiva.plan_id)
      .maybeSingle();
    nombrePlan = plan?.nombre ?? null;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/socios" className={linkVolver}>
          ← Volver a socios
        </Link>
        <h1 className={pageTitle}>
          {socio.nombre}
        </h1>
        <p className="text-sm text-brand-text-muted">DNI {socio.dni}</p>
      </div>

      <section className={card}>
        <h2 className="mb-2 text-lg font-medium text-brand-text">
          Plan actual
        </h2>
        {ventaActiva ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full border border-brand-border bg-brand-surface-2 px-3 py-1 text-brand-text">
              {nombrePlan}
            </span>
            <span className="rounded-full border border-brand-border bg-brand-surface-2 px-3 py-1 text-brand-text-muted">
              {ventaActiva.pases_restantes} pase(s) restante(s)
            </span>
            <span className="rounded-full border border-brand-border bg-brand-surface-2 px-3 py-1 text-brand-text-muted">
              Vence {ventaActiva.fecha_vencimiento}
            </span>
          </div>
        ) : (
          <p className="text-sm text-brand-text-muted">Sin plan actual.</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href={`/ventas/nueva?socioId=${socio.id}`} className={btnPrimary}>
            Vender un plan
          </Link>

          {/* RF-VEN-05: anular una venta cargada por error es solo del
              Gerente, y solo tiene sentido si hay un plan activo. */}
          {ventaActiva && sesion?.cargo === "gerente" && (
            <AnularVentaForm ventaId={ventaActiva.id} />
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-brand-text">
          Datos del socio
        </h2>
        <EditarSocioForm socio={socio} />
      </section>
    </main>
  );
}
