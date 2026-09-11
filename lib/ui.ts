// Sprint 6: clases de Tailwind compartidas para que todas las pantallas
// usen los mismos botones, tarjetas, inputs y alertas — en vez de que
// cada pantalla invente su propio estilo a mano. Si mañana hay que
// ajustar cómo se ve un botón primario, se cambia acá una sola vez.
//
// Los colores de marca (brand-*) están definidos en app/globals.css.
//
// Segunda pasada de Sprint 6 ("más agresivo"): más peso tipográfico,
// más profundidad (sombras, glow, bordes de 2px) y más movimiento
// (hover con lift) en vez de un estilo plano. Sigue siendo el mismo
// negro/gris/verde — más contraste, no más colores.

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-brand-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-xl hover:shadow-brand-primary/30 active:translate-y-0 active:scale-[0.97] active:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100";

// Responsive a propósito: en un celular angosto (320-375px), el
// tamaño "desktop" de este botón (uppercase + tracking-wide + texto
// grande) empuja el contenido y puede desbordar la fila cuando está al
// lado de un input (ver /ingreso) — achicamos un toque en mobile y
// volvemos al tamaño grande desde `sm:` (tablet en adelante, que es
// donde vive esta app en el mostrador).
export const btnPrimaryLg =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 text-sm sm:px-8 sm:py-4 sm:text-base font-extrabold uppercase tracking-wide text-black shadow-xl shadow-brand-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-2xl hover:shadow-brand-primary/40 active:translate-y-0 active:scale-[0.97] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-border px-5 py-2.5 text-sm font-bold text-brand-text transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/60 hover:bg-brand-surface-2 active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-900/60 px-5 py-2.5 text-sm font-bold text-red-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-700 hover:bg-red-950/40 active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-text-muted transition hover:bg-brand-surface hover:text-brand-text disabled:cursor-not-allowed disabled:opacity-50";

export const linkVolver =
  "inline-flex items-center gap-1 text-sm font-semibold text-brand-text-muted transition hover:text-brand-primary";

export const linkAccion =
  "font-bold text-brand-primary underline decoration-brand-primary/0 decoration-2 underline-offset-2 transition hover:decoration-brand-primary/60";

export const tarjeta =
  "animate-fade-in-up flex items-center justify-between gap-2 rounded-xl border-2 border-brand-border bg-brand-surface px-4 py-3 text-sm font-bold text-brand-text shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary hover:bg-brand-surface-2 hover:shadow-brand-primary/10 active:scale-[0.98]";

export const card =
  "animate-fade-in-up rounded-2xl border-2 border-brand-border bg-brand-surface p-5 shadow-lg shadow-black/10";

export const pageTitle =
  "text-3xl font-black tracking-tight text-brand-text sm:text-4xl";

export const sectionTitle =
  "text-xs font-bold tracking-widest text-brand-text-muted uppercase";

export const label = "mb-1.5 block text-sm font-bold text-brand-text";

export const input =
  "w-full rounded-xl border-2 border-brand-border bg-brand-surface-2 px-4 py-2.5 text-brand-text placeholder:text-brand-text-muted transition-colors focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/25";

export const select = input;

export const textarea = input;

// Cajas de aviso (éxito / error / advertencia / info). Los colores de
// alerta se mantienen fuera de la paleta de marca a propósito — solo
// para estados, nunca como color "de Kinetic" (pedido del dueño).
export const alertBase = "rounded-xl border-2 p-4 text-sm font-medium";
export const alertSuccess = `${alertBase} border-green-900/60 bg-green-950/40 text-green-300`;
export const alertError = `${alertBase} border-red-900/60 bg-red-950/40 text-red-300`;
export const alertWarning = `${alertBase} border-amber-900/60 bg-amber-950/40 text-amber-300`;
export const alertInfo = `${alertBase} border-blue-900/60 bg-blue-950/40 text-blue-300`;

// Texto de error/éxito suelto (sin caja), para debajo de un input.
export const textoError = "text-sm font-semibold text-red-400";
export const textoExito = "text-sm font-semibold text-green-400";

// Pastillas de estado (activo/de baja, disponible/no disponible,
// anulado, reversión, etc.) — mismo patrón visual en toda la app en
// vez de que cada pantalla arme su propio badge a mano.
export const badge =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold";
export const badgeNeutral = `${badge} border-brand-border bg-brand-surface-2 text-brand-text-muted`;
export const badgeSuccess = `${badge} border-green-900/60 bg-green-950/40 text-green-300`;
export const badgeWarning = `${badge} border-amber-900/60 bg-amber-950/40 text-amber-300`;
export const badgeDanger = `${badge} border-red-900/60 bg-red-950/40 text-red-300`;

// Tablas: envoltorio con scroll horizontal + estilos de fila/columna.
// El texto de las celdas quedaba muy "liviano" (sin peso, con la
// tipografía del sistema) — ahora que el body usa Geist de verdad
// (ver globals.css) le sumamos algo de peso y tabular-nums para que
// los números de las columnas de plata/cantidades alineen prolijo.
export const tablaWrap =
  "animate-fade-in-up overflow-x-auto rounded-2xl border-2 border-brand-border shadow-lg shadow-black/10";
export const tabla = "w-full min-w-max border-collapse text-left text-sm";
export const tablaHeadRow = "border-b-2 border-brand-border bg-brand-surface-2";
export const tablaHeadCell =
  "px-4 py-3 text-xs font-bold tracking-wider text-brand-text-muted uppercase";
export const tablaRow =
  "border-b border-brand-border/60 transition-colors last:border-0 hover:bg-brand-surface-2/40";
export const tablaCell = "px-4 py-3 font-medium tabular-nums text-brand-text";

// Selector tipo "chip" (radio nativo escondido + label estilado) para
// cuando hay pocas opciones y un <select> nativo queda pobre al lado
// del resto de la UI — ej. elegir coach en el ingreso. Sigue siendo un
// <input type="radio"> real, así que funciona sin JS extra.
export const chipInput = "peer sr-only";
export const chip =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-brand-border bg-brand-surface-2 px-4 py-2.5 text-sm font-bold text-brand-text-muted transition-all duration-200 active:scale-[0.96] hover:border-brand-primary/60 hover:text-brand-text peer-checked:-translate-y-0.5 peer-checked:border-brand-primary peer-checked:bg-brand-primary peer-checked:text-black peer-checked:shadow-lg peer-checked:shadow-brand-primary/30 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-brand-bg";
