import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">
          Sign in to continue to PixelTech.
        </p>
        <LoginForm next={next} />
        <p className="mt-6 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/register" className="text-teal hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-3 rounded-md border border-border bg-surface2 p-3 text-xs text-muted">
          <strong className="text-white">Demo:</strong> ada@pixeltech.dev / password123
        </p>
      </div>
    </div>
  );
}
