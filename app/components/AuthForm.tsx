"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

type AuthMode = "signIn" | "signUp";

export function SignOutButton() {
  const { signOut } = useAuthActions();

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}

export function AuthForm() {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", mode);

      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      await signIn("anonymous");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in as guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-200 w-full max-w-md shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold justify-center mb-4">
          {mode === "signIn" ? "Welcome Back" : "Create Account"}
        </h2>

        {error && (
          <div className="alert alert-error mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : mode === "signIn" ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="divider">OR</div>

        <button
          type="button"
          className="btn btn-outline w-full"
          onClick={handleAnonymousSignIn}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Continue as Guest"
          )}
        </button>

        <p className="text-center mt-4 text-sm">
          {mode === "signIn" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="link link-primary"
                onClick={() => {
                  setMode("signUp");
                  setError(null);
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="link link-primary"
                onClick={() => {
                  setMode("signIn");
                  setError(null);
                }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
