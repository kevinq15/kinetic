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
