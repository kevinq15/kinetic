import Link from "next/link";
import { requerirGerente } from "@/lib/session";
import NuevoPlanForm from "./NuevoPlanForm";
import { linkVolver, pageTitle } from "@/lib/ui";

export default async function NuevoPlanPage() {
  await requerirGerente();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/planes" className={linkVolver}>
          ← Volver a planes
        </Link>
        <h1 className={pageTitle}>
          Crear plan
        </h1>
      </div>
      <NuevoPlanForm />
    </main>
  );
}
