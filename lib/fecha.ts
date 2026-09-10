import "server-only";

const ZONA = "America/Argentina/Buenos_Aires";

// Fecha de hoy en la zona horaria de Argentina, como "YYYY-MM-DD" —
// comparable directo contra un campo `date` de Postgres (Supabase lo
// devuelve como string en ese mismo formato). Nunca hay que confiar en
// `new Date()` a secas para esto: el servidor corre en UTC (mismo
// motivo que el cálculo de fecha_vencimiento en registrar_venta).
export function hoyArgentinaISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: ZONA });
}

// Día y mes de hoy en Argentina, para el aviso de cumpleaños (RF-ING-05).
export function hoyArgentinaDiaMes(): { dia: number; mes: number } {
  const [, mes, dia] = hoyArgentinaISO().split("-").map(Number);
  return { dia, mes };
}

// Ayer en Argentina, como "YYYY-MM-DD". Se usa como tope (`max`) del
// selector de fecha de corte en liquidaciones (RF-LIQ-05): la fecha de
// corte tiene que ser anterior a hoy, nunca hoy ni el futuro — si se
// permitiera "hoy", la liquidación se comería entrenamientos que todavía
// no pasaron ese mismo día (ver Hallazgo de liquidar-y-luego-ingresar).
export function ayerArgentinaISO(): string {
  const [y, m, d] = hoyArgentinaISO().split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  fecha.setUTCDate(fecha.getUTCDate() - 1);
  return fecha.toISOString().slice(0, 10);
}
