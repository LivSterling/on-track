"use client";

import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
} from "convex/react";
import { AuthForm, SignOutButton } from "./components/AuthForm";
import { TaskList } from "./components/TaskList";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <AuthLoading>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="mt-4 text-base-content/70">Loading...</p>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="mb-6 text-3xl font-bold">On-Track</h1>
          <AuthForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <nav className="navbar bg-base-100 shadow-sm">
          <div className="navbar-start" />
          <div className="navbar-center">
            <h1 className="text-xl font-bold">On-Track</h1>
          </div>
          <div className="navbar-end">
            <SignOutButton />
          </div>
        </nav>
        <main className="mx-auto max-w-3xl p-4 sm:p-6">
          <TaskList />
        </main>
      </Authenticated>
    </div>
  );
}
