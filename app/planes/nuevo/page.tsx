import Link from "next/link";
import { requerirGerente } from "@/lib/session";
import NuevoPlanForm from "./NuevoPlanForm";

export default async function NuevoPlanPage() {
  await requerirGerente();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Crear plan</h1>
      <Link href="/planes" className="text-sm text-gray-500 hover:underline">
        ← Volver a planes
      </Link>
      <NuevoPlanForm />
    </main>
  );
}
