import { notFound } from "next/navigation";
import Link from "next/link";
import { requerirGerente } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import EditarPlanForm from "./EditarPlanForm";
import EstadoPlan from "./EstadoPlan";
import { badgeNeutral, badgeSuccess, card, linkVolver } from "@/lib/ui";

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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/planes" className={linkVolver}>
          ← Volver a planes
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-brand-text">
          {plan.nombre}
        </h1>
        <span className={`w-fit ${plan.activo ? badgeSuccess : badgeNeutral}`}>
          {plan.activo ? "Activo" : "Dado de baja"}
        </span>
      </div>

      <section className={`${card} flex flex-col gap-3`}>
        <h2 className="text-lg font-bold text-brand-text">Datos</h2>
        <EditarPlanForm plan={plan} />
      </section>

      <section className={`${card} flex flex-col gap-3`}>
        <h2 className="text-lg font-bold text-brand-text">Estado</h2>
        <EstadoPlan planId={plan.id} activo={plan.activo} />
      </section>
    </main>
  );
}
