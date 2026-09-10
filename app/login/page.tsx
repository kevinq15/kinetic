import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="mb-6 text-2xl font-semibold">Kinetic — Ingreso</h1>
      <LoginForm />
    </main>
  );
}
