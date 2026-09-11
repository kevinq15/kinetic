import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hoyArgentinaISO, hoyArgentinaDiaMes } from "@/lib/fecha";
import ConfirmarIngresoForm from "./ConfirmarIngresoForm";
import VenderPlanInline from "./VenderPlanInline";
import DeshacerIngresoForm from "./DeshacerIngresoForm";
import {
  alertBase,
  alertError,
  alertSuccess,
  alertWarning,
  btnPrimaryLg,
  card,
  linkAccion,
  linkVolver,
  pageTitle,
} from "@/lib/ui";

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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Link href="/" className={linkVolver}>
          ← Volver
        </Link>
        <h1 className={pageTitle}>
          Ingreso al gimnasio
        </h1>
      </div>

      {ok === "1" && (
        <div className={alertSuccess}>
          <p>Ingreso confirmado.</p>
          {ingresoId && dniLimpio && (
            <DeshacerIngresoForm ingresoId={ingresoId} dni={dniLimpio} />
          )}
        </div>
      )}

      {deshecho === "1" && (
        <p className={alertBase + " border-brand-border text-brand-text-muted"}>
          Ingreso deshecho: se devolvió el pase.
        </p>
      )}

      {/* Pensado para tablet/mostrador: input y botón grandes, fáciles
          de tocar. En un celular angosto el botón con texto en
          mayúsculas no entraba al lado del input y se iba de la
          pantalla (había que hacer scroll horizontal para verlo) — por
          eso apila en columna hasta `sm:`, donde vuelven a quedar en
          la misma fila como en tablet/mostrador. */}
      <form className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          name="dni"
          defaultValue={dniLimpio}
          placeholder="DNI del socio"
          autoFocus
          className="min-w-0 flex-1 rounded-lg border border-brand-border bg-brand-surface px-4 py-3 text-lg text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none"
        />
        <button type="submit" className={`${btnPrimaryLg} w-full sm:w-auto`}>
          Buscar
        </button>
      </form>

      {dniLimpio && !socio && (
        <div className={card}>
          <p className="text-sm text-brand-text-muted">
            No hay ningún socio registrado con DNI {dniLimpio}.
          </p>
          <Link
            href={`/socios/nuevo?dni=${encodeURIComponent(dniLimpio)}`}
            className={`${linkAccion} mt-2 inline-block`}
          >
            Cargar socio nuevo →
          </Link>
        </div>
      )}

      {socio && (
        <div className="flex flex-col gap-4">
          <div className={card}>
            <p className="text-lg font-medium text-brand-text">
              {socio.nombre}
            </p>
            <p className="text-sm text-brand-text-muted">DNI {socio.dni}</p>
            {venta && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full border border-brand-border bg-brand-surface-2 px-3 py-1 text-brand-text">
                  {nombrePlan}
                </span>
                <span className="rounded-full border border-brand-border bg-brand-surface-2 px-3 py-1 text-brand-text-muted">
                  {venta.pases_restantes} pase(s) restante(s)
                </span>
                <span className="rounded-full border border-brand-border bg-brand-surface-2 px-3 py-1 text-brand-text-muted">
                  Vence {venta.fecha_vencimiento}
                </span>
              </div>
            )}
          </div>

          {esCumple && (
            <p className={`${alertBase} border-pink-900/60 bg-pink-950/40 text-pink-300`}>
              🎂 Hoy es el cumpleaños de {socio.nombre}.
            </p>
          )}

          {motivoBloqueo && (
            <div className={`${card} flex flex-col gap-3`}>
              <p className={alertError}>Ingreso bloqueado: {motivoBloqueo}</p>
              <p className="text-sm text-brand-text-muted">
                Vender un plan nuevo ahora habilita el ingreso:
              </p>
              {planesActivos.length === 0 ? (
                <p className={alertWarning}>
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
            <div className={`${card} flex flex-col gap-3`}>
              {avisoUltimaVisita && (
                <p className={alertWarning}>
                  ⚠ Este es el último pase de su plan actual.
                </p>
              )}
              {avisoVenceHoy && (
                <p className={alertWarning}>⚠ Su plan vence hoy.</p>
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
