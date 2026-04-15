import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-[#0A0A16]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border-2 border-accent bg-accent/20 font-mono text-accent">
              {"<>"}
            </span>
            <span className="font-mono font-bold">PixelTech</span>
          </div>
          <p className="mt-3 text-sm text-muted">
            A computer technology blog and community for working engineers.
          </p>
        </div>

        <FootCol
          title="Explore"
          links={[
            ["Home", "/"],
            ["Tags", "/tags"],
            ["Trending", "/trending"],
            ["Search", "/search"],
          ]}
        />
        <FootCol
          title="Community"
          links={[
            ["Write a post", "/write"],
            ["Sign up", "/register"],
            ["Sign in", "/login"],
            ["Bookmarks", "/bookmarks"],
          ]}
        />
        <FootCol
          title="About"
          links={[
            ["About", "/about"],
            ["Accessibility", "/accessibility"],
            ["Privacy", "/privacy"],
            ["Terms", "/terms"],
          ]}
        />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-4 py-6 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} PixelTech. Built with accessibility in mind (WCAG 2.1 AA).</p>
          <p>Made with Next.js, Prisma, and a lot of espresso.</p>
        </div>
      </div>
    </footer>
  );
}

function FootCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-muted hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
