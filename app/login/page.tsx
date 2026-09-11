import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      {/* Logo grande de bienvenida — además del chico del header, acá
          es el protagonista de la pantalla. Mismo <img> común (no
          next/image) por el mismo motivo que en el header, con el
          glow "grande" reservado para este tipo de lugar protagónico. */}
      <img
        src="/logo-kinetic.png"
        alt="Kinetic"
        width={128}
        height={128}
        className="brand-logo-glow-lg rounded-2xl"
      />

      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-black tracking-tight text-brand-text">
          Iniciar sesión
        </h1>
        <p className="text-xs font-semibold tracking-widest text-brand-text-muted uppercase">
          Centro de Acondicionamiento Físico
        </p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border-2 border-brand-border bg-brand-surface p-6 shadow-xl shadow-black/30">
        <LoginForm />
      </div>
    </main>
  );
}
