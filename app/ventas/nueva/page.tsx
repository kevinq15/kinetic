import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import VentaForm from "./VentaForm";
import { alertWarning, linkVolver, pageTitle } from "@/lib/ui";

export default async function NuevaVentaPage({
  searchParams,
}: {
  searchParams: Promise<{ socioId?: string }>;
}) {
  const { socioId } = await searchParams;

  // RF-SOC-02: vender un plan ya no crea el socio de paso — tiene que
  // existir de antes. Sin un socioId válido no hay nada que vender.
  let socio: { id: string; nombre: string; dni: string } | null = null;
  if (socioId) {
    const { data } = await supabaseAdmin
      .from("socios")
      .select("id, nombre, dni")
      .eq("id", socioId)
      .maybeSingle();
    socio = data;
  }

  if (!socio) {
    redirect("/socios");
  }

  const { data: planes } = await supabaseAdmin
    .from("planes")
    .select("id, nombre, precio, cantidad_pases, duracion_dias")
    .eq("activo", true)
    .order("nombre", { ascending: true });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/socios" className={linkVolver}>
          ← Volver a socios
        </Link>
        <h1 className={pageTitle}>
          Vender un plan
        </h1>
      </div>

      {planes && planes.length === 0 && (
        <p className={alertWarning}>
          Todavía no hay ningún plan activo en el catálogo — creá uno primero
          en Gestionar catálogo de planes.
        </p>
      )}

      <VentaForm socio={socio} planes={planes ?? []} />
    </main>
  );
}
