import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hoyArgentinaISO, hoyArgentinaDiaMes } from "@/lib/fecha";
import ConfirmarIngresoForm from "./ConfirmarIngresoForm";
import VenderPlanInline from "./VenderPlanInline";
import DeshacerIngresoForm from "./DeshacerIngresoForm";

type Socio = {
  id: string;
  nombre: string;
  dni: string;
  fecha_nacimiento: string | null;
};

type Venta = {
  id: string;
  plan_id: string;
  pases_restantes: number;
  fecha_vencimiento: string;
};

type Plan = {
  id: string;
  nombre: string;
  precio: number;
  cantidad_pases: number;
  duracion_dias: number;
};

type CoachOpcion = { coachId: string; nombre: string; esGerente: boolean };

export default async function IngresoPage({
  searchParams,
}: {
  searchParams: Promise<{
    dni?: string;
    ok?: string;
    ingresoId?: string;
    deshecho?: string;
  }>;
}) {
  const { dni, ok, ingresoId, deshecho } = await searchParams;
  const dniLimpio = dni?.trim() ?? "";

  let socio: Socio | null = null;
  let venta: Venta | null = null;
  let nombrePlan: string | null = null;
  let planesActivos: Plan[] = [];
  let coaches: CoachOpcion[] = [];

  // RF-ING-01: el DNI llega por un teclado numérico USB que para el
  // sistema es un teclado más — no hay nada especial que integrar, es
  // un input de texto común.
  if (dniLimpio) {
    const { data } = await supabaseAdmin
      .from("socios")
      .select("id, nombre, dni, fecha_nacimiento")
      .eq("dni", dniLimpio)
      .maybeSingle();
    socio = data;
  }

  if (socio) {
    // RF-ING-02: el plan actual es la última compra (la venta activa).
    const { data: ventaData } = await supabaseAdmin
      .from("ventas")
      .select("id, plan_id, pases_restantes, fecha_vencimiento")
      .eq("socio_id", socio.id)
      .eq("activa", true)
      .maybeSingle();
    venta = ventaData;

    if (venta) {
      const { data: plan } = await supabaseAdmin
        .from("planes")
        .select("nombre")
        .eq("id", venta.plan_id)
        .maybeSingle();
      nombrePlan = plan?.nombre ?? null;
    }
  }

  const hoy = hoyArgentinaISO();
  const puedeEntrar =
    !!venta && venta.pases_restantes > 0 && hoy <= venta.fecha_vencimiento;

  let motivoBloqueo: string | null = null;
  if (socio && !venta) {
    motivoBloqueo = "Este socio no tiene un plan cargado.";
  } else if (socio && venta && venta.pases_restantes <= 0) {
    motivoBloqueo = "No le quedan pases en su plan actual.";
  } else if (socio && venta && hoy > venta.fecha_vencimiento) {
    motivoBloqueo = `Su plan venció el ${venta.fecha_vencimiento}.`;
  }

  // RF-ING-05: aviso informativo de cumpleaños, no afecta nada más.
  let esCumple = false;
  if (socio?.fecha_nacimiento) {
    const [, mesNac, diaNac] = socio.fecha_nacimiento.split("-").map(Number);
    const { dia, mes } = hoyArgentinaDiaMes();
    esCumple = dia === diaNac && mes === mesNac;
  }

  // RF-ING-07: avisos antes de confirmar (última visita / vence hoy).
  const avisoUltimaVisita = puedeEntrar && venta!.pases_restantes === 1;
  const avisoVenceHoy = puedeEntrar && venta!.fecha_vencimiento === hoy;

  if (socio && motivoBloqueo) {
    const { data: planes } = await supabaseAdmin
      .from("planes")
      .select("id, nombre, precio, cantidad_pases, duracion_dias")
      .eq("activo", true)
      .order("nombre", { ascending: true });
    planesActivos = planes ?? [];
  }

  if (socio && puedeEntrar) {
    // RF-ING-03/10: solo coaches (+ Gerente) disponibles y con usuario
    // activo. Consulta en dos pasos, mismo motivo que en /coaches y
    // /socios/[id]: no hay tipos generados de Supabase en este proyecto.
    const { data: usuariosCoach } = await supabaseAdmin
      .from("usuarios")
      .select("id, nombre, cargo")
      .in("cargo", ["coach", "gerente"])
      .eq("activo", true)
      .order("nombre", { ascending: true });

    const usuarioIds = (usuariosCoach ?? []).map((u) => u.id);
    const { data: coachesRows } =
      usuarioIds.length > 0
        ? await supabaseAdmin
            .from("coaches")
            .select("id, usuario_id, disponible")
            .in("usuario_id", usuarioIds)
        : {
            data: [] as {
              id: string;
              usuario_id: string;
              disponible: boolean;
            }[],
          };

    coaches = (usuariosCoach ?? []).flatMap((u) => {
      const c = (coachesRows ?? []).find((row) => row.usuario_id === u.id);
      if (!c || !c.disponible) return [];
      return [
        { coachId: c.id, nombre: u.nombre, esGerente: u.cargo === "gerente" },
      ];
    });
  }

  const coachPorDefecto = coaches.find((c) => c.esGerente)?.coachId ?? "";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Ingreso al gimnasio</h1>
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Volver
      </Link>

      {ok === "1" && (
        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <p>Ingreso confirmado.</p>
          {ingresoId && dniLimpio && (
            <DeshacerIngresoForm ingresoId={ingresoId} dni={dniLimpio} />
          )}
        </div>
      )}

      {deshecho === "1" && (
        <p className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          Ingreso deshecho: se devolvió el pase.
        </p>
      )}

      <form className="flex max-w-sm gap-2">
        <input
          type="text"
          name="dni"
          defaultValue={dniLimpio}
          placeholder="DNI del socio"
          autoFocus
          className="flex-1 rounded border border-gray-300 px-3 py-3 text-lg"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 font-medium text-white"
        >
          Buscar
        </button>
      </form>

      {dniLimpio && !socio && (
        <div className="rounded border border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            No hay ningún socio registrado con DNI {dniLimpio}.
          </p>
          <Link
            href={`/socios/nuevo?dni=${encodeURIComponent(dniLimpio)}`}
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            Cargar socio nuevo →
          </Link>
        </div>
      )}

      {socio && (
        <div className="flex flex-col gap-4">
          <div className="rounded border border-gray-200 p-4">
            <p className="text-lg font-medium">{socio.nombre}</p>
            <p className="text-sm text-gray-500">DNI {socio.dni}</p>
            {venta && (
              <p className="mt-2 text-sm">
                Plan: {nombrePlan} — {venta.pases_restantes} pase(s)
                restante(s) — vence {venta.fecha_vencimiento}
              </p>
            )}
          </div>

          {esCumple && (
            <p className="rounded border border-pink-200 bg-pink-50 p-3 text-sm text-pink-800">
              🎂 Hoy es el cumpleaños de {socio.nombre}.
            </p>
          )}

          {motivoBloqueo && (
            <div className="flex flex-col gap-3 rounded border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                Ingreso bloqueado: {motivoBloqueo}
              </p>
              <p className="text-sm text-red-900">
                Vender un plan nuevo ahora habilita el ingreso:
              </p>
              {planesActivos.length === 0 ? (
                <p className="text-sm text-amber-700">
                  No hay ningún plan activo en el catálogo.
                </p>
              ) : (
                <VenderPlanInline
                  socioId={socio.id}
                  dni={socio.dni}
                  planes={planesActivos}
                />
              )}
            </div>
          )}

          {puedeEntrar && (
            <div className="flex flex-col gap-3 rounded border border-gray-200 p-4">
              {avisoUltimaVisita && (
                <p className="text-sm font-medium text-amber-700">
                  ⚠ Este es el último pase de su plan actual.
                </p>
              )}
              {avisoVenceHoy && (
                <p className="text-sm font-medium text-amber-700">
                  ⚠ Su plan vence hoy.
                </p>
              )}
              <ConfirmarIngresoForm
                socioId={socio.id}
                dni={socio.dni}
                coaches={coaches}
                coachPorDefecto={coachPorDefecto}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
