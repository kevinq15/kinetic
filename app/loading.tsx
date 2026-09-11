import { BarbellSpinner, PawPrint } from "@/components/Spinner";

// Loading UI global: Next.js la muestra automáticamente mientras carga
// cualquier pantalla que no tenga su propio loading.tsx (todas, por
// ahora) — no hay que llamarla a mano desde ningún lado. Con tantas
// pantallas haciendo 2-3 consultas a Supabase antes de poder pintar
// algo, vale la pena que la espera se sienta "de la marca" en vez de
// una pantalla en blanco.
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <BarbellSpinner className="h-10 w-10 text-brand-primary" />
      <div className="flex flex-col items-center gap-3">
        <p className="brand-gradient-text text-lg font-black tracking-tight">
          Cargando
        </p>
        <div className="flex gap-3">
          <PawPrint delayMs={0} />
          <PawPrint delayMs={200} />
          <PawPrint delayMs={400} />
        </div>
      </div>
    </main>
  );
}
