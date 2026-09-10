import Link from "next/link";
import { requerirGerente } from "@/lib/session";
import NuevoUsuarioForm from "./NuevoUsuarioForm";

export default async function NuevoUsuarioPage() {
  await requerirGerente();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Crear usuario interno</h1>
      <Link href="/usuarios" className="text-sm text-gray-500 hover:underline">
        ← Volver a usuarios
      </Link>
      <NuevoUsuarioForm />
    </main>
  );
}
