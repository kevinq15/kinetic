import Link from "next/link";
import NuevoSocioForm from "./NuevoSocioForm";
import { linkVolver, pageTitle } from "@/lib/ui";

export default async function NuevoSocioPage({
  searchParams,
}: {
  searchParams: Promise<{ dni?: string }>;
}) {
  const { dni } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/socios" className={linkVolver}>
          ← Volver a socios
        </Link>
        <h1 className={pageTitle}>Socio nuevo</h1>
      </div>

      <p className="text-sm text-brand-text-muted">
        Esto solo carga los datos del socio. La venta de un plan es un paso
        aparte, que se hace después desde su ficha (o ahora mismo, si vino a
        pagar).
      </p>

      <NuevoSocioForm dniPrellenado={dni ?? ""} />
    </main>
  );
}
