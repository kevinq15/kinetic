import Link from "next/link";
import NuevoSocioForm from "./NuevoSocioForm";

export default async function NuevoSocioPage({
  searchParams,
}: {
  searchParams: Promise<{ dni?: string }>;
}) {
  const { dni } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Socio nuevo</h1>
      <Link href="/socios" className="text-sm text-gray-500 hover:underline">
        ← Volver a socios
      </Link>

      <p className="text-sm text-gray-600">
        Esto solo carga los datos del socio. La venta de un plan es un paso
        aparte, que se hace después desde su ficha (o ahora mismo, si vino a
        pagar).
      </p>

      <NuevoSocioForm dniPrellenado={dni ?? ""} />
    </main>
  );
}
