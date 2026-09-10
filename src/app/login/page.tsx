import LoginForm from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <a href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded bg-secondary/20 border border-secondary/40 flex items-center justify-center">
            <div className="w-3 h-3 border border-secondary" style={{ transform: "rotate(45deg)" }} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-text-primary">
            Kareixo
          </span>
        </a>
      </div>
      <Suspense fallback={<div className="text-center text-sm text-text-secondary">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
