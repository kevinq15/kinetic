import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { obtenerSesion } from "@/lib/session";
import EditarSocioForm from "./EditarSocioForm";
import AnularVentaForm from "./AnularVentaForm";

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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 p-6">
      <Link href="/socios" className="text-sm text-gray-500 hover:underline">
        ← Volver a socios
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{socio.nombre}</h1>
        <p className="text-sm text-gray-500">DNI {socio.dni}</p>
      </div>

      <section className="rounded border border-gray-200 p-4">
        <h2 className="mb-2 text-lg font-medium">Plan actual</h2>
        {ventaActiva ? (
          <div className="text-sm">
            <p>Plan: {nombrePlan}</p>
            <p>Pases restantes: {ventaActiva.pases_restantes}</p>
            <p>Vence: {ventaActiva.fecha_vencimiento}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sin plan actual.</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Link
            href={`/ventas/nueva?socioId=${socio.id}`}
            className="inline-block rounded bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Vender un plan
          </Link>

          {/* RF-VEN-05: anular una venta cargada por error es solo del
              Gerente, y solo tiene sentido si hay un plan activo. */}
          {ventaActiva && sesion?.cargo === "gerente" && (
            <AnularVentaForm ventaId={ventaActiva.id} />
          )}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Datos del socio</h2>
        <EditarSocioForm socio={socio} />
      </section>
    </main>
  );
}
