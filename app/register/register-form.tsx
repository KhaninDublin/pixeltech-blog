"use client";

import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="label" htmlFor="name">Full name</label>
        <input id="name" name="name" required minLength={2} maxLength={80} className="input" autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="username">Username</label>
        <input id="username" name="username" required minLength={3} maxLength={24} pattern="^[A-Za-z0-9_]+$" className="input" autoComplete="username" />
        <p className="mt-1 text-xs text-muted">Letters, numbers, underscore. This becomes your profile URL.</p>
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={8} className="input" autoComplete="new-password" />
        <p className="mt-1 text-xs text-muted">8 characters minimum.</p>
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
