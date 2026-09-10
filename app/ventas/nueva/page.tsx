import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import VentaForm from "./VentaForm";

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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Vender un plan</h1>
      <Link href="/socios" className="text-sm text-gray-500 hover:underline">
        ← Volver a socios
      </Link>

      {planes && planes.length === 0 && (
        <p className="text-sm text-amber-700">
          Todavía no hay ningún plan activo en el catálogo — creá uno primero
          en Gestionar catálogo de planes.
        </p>
      )}

      <VentaForm socio={socio} planes={planes ?? []} />
    </main>
  );
}
