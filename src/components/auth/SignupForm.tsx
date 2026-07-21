"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "An error occurred during signup.");
        setIsLoading(false);
        return;
      }

      // Success, sign in via credentials
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created, but automatic sign-in failed. Please log in.");
        setIsLoading(false);
      } else {
        router.push("/ide");
      }
    } catch (err: any) {
      setError("Network error. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: "github" | "google") => {
    signIn(provider, { callbackUrl: "/ide" });
  };

  return (
    <div className="card max-w-md w-full mx-auto mt-16">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-dusk-900 mb-2">
          Create free account
        </h2>
        <p className="text-dusk-500 text-sm">
          No credit card required. No usage limits.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        <button
          onClick={() => handleOAuth("github")}
          className="btn btn-secondary w-full"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Sign up with GitHub
        </button>
        <button
          onClick={() => handleOAuth("google")}
          className="btn btn-secondary w-full"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
          Sign up with Google
        </button>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-cream-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-cream-100 text-dusk-500">
            Or sign up with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-400/10 border border-red-400/30 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-dusk-700 mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-cream-200 border border-cream-300 rounded-md text-dusk-900 focus:outline-none focus:border-coral-400 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dusk-700 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-cream-200 border border-cream-300 rounded-md text-dusk-900 focus:outline-none focus:border-coral-400 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dusk-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-cream-200 border border-cream-300 rounded-md text-dusk-900 focus:outline-none focus:border-coral-400 transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full mt-2"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-dusk-500 mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-coral-400 hover:text-coral-300">
          Sign in
        </a>
      </p>
    </div>
  );
}
