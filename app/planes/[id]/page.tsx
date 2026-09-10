import { notFound } from "next/navigation";
import Link from "next/link";
import { requerirGerente } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import EditarPlanForm from "./EditarPlanForm";
import EstadoPlan from "./EstadoPlan";

export default async function EditarPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requerirGerente();
  const { id } = await params;

  const { data: plan } = await supabaseAdmin
    .from("planes")
    .select("id, nombre, cantidad_pases, duracion_dias, precio, activo")
    .eq("id", id)
    .maybeSingle();

  if (!plan) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 p-6">
      <Link href="/planes" className="text-sm text-gray-500 hover:underline">
        ← Volver a planes
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{plan.nombre}</h1>
        <p className="text-sm text-gray-500">
          {plan.activo ? "Activo" : "Dado de baja"}
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Datos</h2>
        <EditarPlanForm plan={plan} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Estado</h2>
        <EstadoPlan planId={plan.id} activo={plan.activo} />
      </section>
    </main>
  );
}
