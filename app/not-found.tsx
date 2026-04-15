import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-6xl font-bold text-accent">404</p>
      <h1 className="mt-3 text-2xl font-bold">This page does not exist</h1>
      <p className="mt-2 text-muted">
        The link may be broken or the post may have been removed.
      </p>
      <Link href="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
