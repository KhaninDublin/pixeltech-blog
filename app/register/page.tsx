import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted">
          Join writers and engineers sharing what they learn.
        </p>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted">
          Already a member?{" "}
          <Link href="/login" className="text-teal hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
