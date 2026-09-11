import Link from "next/link";
import { requerirGerente } from "@/lib/session";
import NuevoUsuarioForm from "./NuevoUsuarioForm";
import { linkVolver, pageTitle } from "@/lib/ui";

export default async function NuevoUsuarioPage() {
  await requerirGerente();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/usuarios" className={linkVolver}>
          ← Volver a usuarios
        </Link>
        <h1 className={pageTitle}>Crear usuario interno</h1>
      </div>
      <NuevoUsuarioForm />
    </main>
  );
}
