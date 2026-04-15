import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";
import { Search, PenSquare } from "lucide-react";

export async function SiteHeader() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border-2 border-accent bg-accent/20 font-mono text-accent group-hover:border-accent-hover">
            {"<>"}
          </span>
          <span className="font-mono text-lg font-bold tracking-tight">PixelTech</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4 text-sm">
          <Link href="/" className="px-3 py-2 text-text/80 hover:text-white">
            Home
          </Link>
          <Link href="/tags" className="px-3 py-2 text-text/80 hover:text-white">
            Tags
          </Link>
          <Link href="/trending" className="px-3 py-2 text-text/80 hover:text-white">
            Trending
          </Link>
          <Link href="/about" className="px-3 py-2 text-text/80 hover:text-white">
            About
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            className="btn-ghost p-2"
            aria-label="Search"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/write"
                className="btn-teal hidden sm:inline-flex"
                aria-label="Write a new post"
              >
                <PenSquare className="h-4 w-4" /> Write
              </Link>
              <UserMenu
                user={{
                  name: session.user.name ?? "",
                  username: session.user.username ?? "",
                  image: session.user.image ?? null,
                  role: session.user.role,
                }}
              />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
