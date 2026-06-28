import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <a href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded bg-coral-400/20 border border-coral-400/40 flex items-center justify-center glow-cyan">
            <div className="w-3 h-3 border border-coral-300" style={{ transform: "rotate(45deg)" }} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-dusk-900">
            Kareixo
          </span>
        </a>
      </div>
      <SignupForm />
    </main>
  );
}
