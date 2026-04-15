import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

const toSlug = (s: string) =>
  slugify(s, { lower: true, strict: true, trim: true }).slice(0, 80);

const TAGS = [
  { name: "JavaScript", color: "#F7DF1E" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "React", color: "#61DAFB" },
  { name: "Next.js", color: "#FFFFFF" },
  { name: "AI", color: "#A78BFA" },
  { name: "DevOps", color: "#06D6A0" },
  { name: "Security", color: "#EF4444" },
  { name: "Databases", color: "#F59E0B" },
  { name: "Career", color: "#F472B6" },
  { name: "Open Source", color: "#10B981" },
];

const POSTS: Array<{
  title: string;
  tags: string[];
  excerpt: string;
  content: string;
  featured?: boolean;
  author: "ada" | "linus" | "grace" | "admin";
  cover?: string;
}> = [
  {
    title: "Why Server Components Finally Made Me Rethink React",
    tags: ["React", "Next.js", "TypeScript"],
    featured: true,
    author: "ada",
    excerpt:
      "After a year of shipping App Router in production, here is the honest breakdown of what Server Components fixed, what they broke, and the mental model that actually stuck.",
    content: `# Why Server Components Finally Made Me Rethink React

After shipping React since 2015, I thought I had the mental model locked. Then Server Components arrived, and for about six months I kept getting it *almost* right.

This is the post I wish I had read on day one.

## The one sentence that clicked

> A Server Component is a function that runs **once**, on the server, during a request. Everything it returns is serialized HTML and sent to the browser.

That is it. No lifecycle. No state. No \`useEffect\`. Just a function you \`await\` inside.

\`\`\`tsx
export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post) return notFound();
  return <Article post={post} />;
}
\`\`\`

## The three rules I now live by

1. **Fetch at the edge of the tree.** The deeper a server fetch lives, the more waterfalls you invite.
2. **Client Components are leaves.** Use them for inputs, dropdowns, charts with state. Not for pages.
3. **Server Actions replace 80% of your API routes.** The other 20% should exist for external callers only.

## What actually broke

Third-party libraries that ship \`"use client"\` at the root force an entire tree into the client. Watch for this when you install a UI kit — if the package adds 200kb to your bundle, check the top of its \`index.js\`.

## Verdict

Server Components are not a free win. But after the adjustment period, my team's pages render 40% faster, and the "where does this data come from?" question has a consistent answer. That alone was worth the rewrite.`,
  },
  {
    title: "A Practical Guide to Indexing Postgres for the Next 10x",
    tags: ["Databases", "DevOps"],
    author: "linus",
    excerpt:
      "Seven query patterns, the indexes that make them fast, and the one technique that lets you skip a full table rewrite.",
    content: `# A Practical Guide to Indexing Postgres for the Next 10x

Most Postgres performance problems are not CPU problems. They are *index* problems.

## Start with \`EXPLAIN (ANALYZE, BUFFERS)\`

Before touching an index, read the plan. \`Seq Scan\` on a table over 10k rows is a yellow flag; on 1M rows it is red.

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC LIMIT 20;
\`\`\`

## Composite indexes follow the filter-then-sort rule

If your query filters by A and sorts by B, the index should be \`(A, B DESC)\` — in that order. A single column index on \`A\` forces a sort; two separate indexes force a bitmap merge.

## Use partial indexes when you can

\`\`\`sql
CREATE INDEX posts_published_idx
  ON posts (created_at DESC)
  WHERE published = true;
\`\`\`

This index only stores published rows. It is smaller, faster to maintain, and Postgres automatically picks it when \`published = true\` appears in your \`WHERE\`.

## The one trick nobody tells juniors

\`CREATE INDEX CONCURRENTLY\`. Never lock a production table during index creation. It is slower but safe.

## When to reach for covering indexes

If a query hits exactly one or two columns, add them to the index payload with \`INCLUDE\`. The planner can answer the query without touching the heap — this is called an index-only scan and it is often 5-10x faster.

Go read your slowest query right now. Paste the plan into \`EXPLAIN\` and look for the word \`Seq Scan\`. That is your first target.`,
  },
  {
    title: "How I Shipped a Production-Grade Auth Flow in One Evening",
    tags: ["Security", "Next.js", "TypeScript"],
    author: "grace",
    excerpt:
      "Auth.js + Prisma + credentials provider + middleware gates — a checklist that gets you past the 'it works on my machine' line.",
    content: `# How I Shipped a Production-Grade Auth Flow in One Evening

Auth does not have to be a week-long project. Here is the minimum viable checklist I use.

## 1. Pick your adapter first, not your UI

The auth layer is a data layer, not a view layer. I use \`@auth/prisma-adapter\` because it gives me a real \`User\` row I can join against \`Post.authorId\`. Everything else is cosmetic.

## 2. Hash with a salt you do not manage

\`\`\`ts
import bcrypt from "bcryptjs";
const hash = await bcrypt.hash(password, 12);
\`\`\`

12 rounds is the sweet spot in 2026. Anything less is too fast for modern GPUs; anything more punishes your login latency.

## 3. JWT vs. database sessions

Use **JWT** on serverless. Database sessions make every request a round trip to your DB — fine for a monolith, painful on Vercel. The trade-off: JWT revocation requires a short expiry + a token version column.

## 4. Middleware gates, not route gates

\`\`\`ts
// middleware.ts
export { auth as middleware } from "@/lib/auth";
export const config = { matcher: ["/write", "/admin/:path*"] };
\`\`\`

One file protects every route under a prefix. Forget to list a route? You find out the next deploy, not the next breach.

## 5. Rate-limit login attempts

Five failures per 15 minutes per IP. A Redis counter is enough. Without this, your login endpoint is a free credential-stuffing oracle.

## The checklist, once more

- [ ] Adapter points at real User table
- [ ] \`bcrypt\` (or Argon2id) at 12 rounds
- [ ] JWT sessions for serverless
- [ ] Middleware matcher covers all gated routes
- [ ] Login rate limiting in place
- [ ] Email verification before any sensitive action

That is it. You are now above 90% of production auth flows I have reviewed this year.`,
  },
  {
    title: "The Hidden Cost of Barrel Files in Modern Monorepos",
    tags: ["JavaScript", "TypeScript", "DevOps"],
    author: "ada",
    excerpt:
      "\"Just re-export everything from index.ts\" — the three words that silently doubled our build time.",
    content: `# The Hidden Cost of Barrel Files in Modern Monorepos

A barrel file is an \`index.ts\` that re-exports everything from a folder:

\`\`\`ts
// packages/ui/src/index.ts
export * from "./button";
export * from "./card";
export * from "./avatar";
// ...47 more lines
\`\`\`

It looks clean. It is a trap.

## Why it hurts

When a consumer writes \`import { Button } from "@my/ui"\`, the TypeScript compiler has to type-check **every** re-exported file to figure out what \`Button\` is. In a monorepo with 60 packages, that compounds into minutes of extra build time per CI run.

## The test

Run this in your repo:

\`\`\`bash
time tsc --noEmit
\`\`\`

Now delete every barrel file and import directly (\`import { Button } from "@my/ui/button"\`). Run it again. I have yet to see a repo where it did not drop by at least 25%.

## When barrels are fine

- Tiny packages (under 10 files)
- Third-party libraries where bundle size matters more than build time
- Server-side-only code, where cold-start time dominates

## The replacement pattern

Expose explicit subpath exports in \`package.json\`:

\`\`\`json
{
  "exports": {
    "./button": "./dist/button.js",
    "./card":   "./dist/card.js"
  }
}
\`\`\`

Consumers get autocomplete, bundlers get tree-shaking, and your CI stops lighting money on fire.`,
  },
  {
    title: "RAG Without the Magic: A No-Framework Walkthrough",
    tags: ["AI", "TypeScript", "Databases"],
    featured: true,
    author: "grace",
    excerpt:
      "LangChain is a library, not an architecture. Here is how the four moving pieces of a RAG system actually fit together.",
    content: `# RAG Without the Magic: A No-Framework Walkthrough

Retrieval-Augmented Generation is the most over-tooled problem in AI today. Strip away the frameworks and it is four steps.

## The four pieces

1. **Chunk** your documents into ~500-token passages.
2. **Embed** each chunk with a model like \`text-embedding-3-small\`.
3. **Store** chunks + vectors in any DB with vector search (Postgres + \`pgvector\` works).
4. **At query time**, embed the user question, find the top-K nearest chunks, paste them into the prompt.

That is it. No chains. No agents.

\`\`\`ts
const embedding = await embed(userQuery);
const chunks = await prisma.$queryRaw\`
  SELECT content FROM doc_chunks
  ORDER BY embedding <=> ${embedding}::vector
  LIMIT 5
\`;
const answer = await llm.complete({
  system: "Answer only using the provided context.",
  context: chunks.map(c => c.content).join("\\n\\n"),
  question: userQuery,
});
\`\`\`

## Where it actually fails

- **Chunk size**. Too small and you lose context; too big and one irrelevant chunk drowns the prompt. Start at 500 tokens with 50-token overlap.
- **Metadata filters**. Without them, a query about "billing" retrieves marketing blog posts. Tag every chunk with source, date, product.
- **Reranking**. Top-K by cosine similarity is a first pass. Run a small reranker model (Cohere or a fine-tuned cross-encoder) over the top 20 to pick the true top 5.

## The model picker heuristic

- Under 10k docs: skip the vector DB, just stuff everything into the context window of a long-context model. It is faster and cheaper.
- 10k-10M docs: pgvector inside your main DB.
- 10M+ docs: dedicated vector store (Pinecone, Weaviate). You need to care about index type (HNSW vs. IVF) at that scale.

The whole point of RAG is that you own the retrieval, which means you own the answers. If you cannot explain why chunk X was retrieved, you do not have a RAG system — you have a demo.`,
  },
  {
    title: "Five Git Habits That Separate Senior Engineers From Everyone Else",
    tags: ["Career", "Open Source"],
    author: "linus",
    excerpt:
      "None of them are about knowing rare commands. All of them are about making your history a gift to the next reader.",
    content: `# Five Git Habits That Separate Senior Engineers From Everyone Else

After reviewing ~4,000 PRs, the delta between junior and senior engineers is rarely algorithmic. It is almost entirely *how they communicate through git*.

## 1. One logical change per commit

Not "one file per commit". Not "one feature per commit". One *reason for the reader to care* per commit. If you find yourself writing "and also" in a commit message, stop and split.

## 2. Write the message for your future self on a Sunday at 2am

You will be that person. Someday production will break, you will \`git blame\`, and the past you who wrote "fix stuff" will become your enemy.

Good:
> Prevent double-charge when Stripe retries a declined webhook

Bad:
> fix bug

## 3. Rebase, don't merge, before you open a PR

\`git pull --rebase\` on your branch gives reviewers a clean linear history. \`git pull\` (merge) makes them read a knotted tree. Same code, very different review experience.

## 4. Interactive rebase is not advanced

\`git rebase -i HEAD~5\` to squash fixups, reorder, or reword commits is basic hygiene. The output of a PR should be the story of the change, not the archaeology of how you stumbled to it.

## 5. Keep a clean working tree at the end of the day

\`git status\` at 6pm should be empty. Either commit, stash with a clear label, or throw it away. Uncommitted work overnight is how weekend outages happen.

These are not rules. They are gifts to whoever inherits your code — which is eventually, always, you.`,
  },
  {
    title: "A Minimal Go Service That Does One Thing Extremely Well",
    tags: ["DevOps", "Open Source"],
    author: "linus",
    excerpt:
      "Not every service needs a framework. Here is a 140-line webhook receiver that has run without a restart for 18 months.",
    content: `# A Minimal Go Service That Does One Thing Extremely Well

The best production code I have shipped was 140 lines of Go. It is a webhook receiver. It has run for 18 months without a restart.

## The whole thing

- \`net/http\` standard library only
- No framework, no router, no ORM
- One \`main.go\`, one \`handler.go\`, one \`queue.go\`
- Writes to a Postgres outbox table, lets a separate worker drain it

## The shape

\`\`\`go
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
    defer cancel()

    body, err := io.ReadAll(io.LimitReader(r.Body, 64<<10))
    if err != nil { http.Error(w, "bad body", 400); return }

    if !verifySignature(r.Header.Get("X-Signature"), body) {
        http.Error(w, "invalid signature", 401); return
    }

    if err := h.queue.Enqueue(ctx, body); err != nil {
        http.Error(w, "queue full", 503); return
    }
    w.WriteHeader(204)
}
\`\`\`

## Why it is bulletproof

1. **Bounded reads.** \`io.LimitReader\` caps the request body at 64KB. No malicious actor can OOM the process.
2. **Short context timeouts.** Nothing blocks for longer than 3 seconds. The caller always gets an answer.
3. **Outbox pattern.** The HTTP handler never talks to the downstream. It writes to a queue. If the downstream is slow, the webhook still returns 204.
4. **No dependencies.** Every third-party package is a supply chain attack waiting to happen. Standard library only means zero CVE notifications.

## The lesson

"Boring technology" wins. A framework saves you five minutes at write time and costs you a week every time it has a breaking change. Pick the smaller tool.`,
  },
  {
    title: "Stop Writing Tests for Your Implementation — Test the Behaviour",
    tags: ["Career", "TypeScript"],
    author: "ada",
    excerpt:
      "If renaming an internal function breaks a test, that test is debt. Here is the rule I use to tell the two apart.",
    content: `# Stop Writing Tests for Your Implementation

Most failing tests in a healthy codebase are not catching bugs. They are punishing refactors.

## The one-sentence rule

> If I rename this internal function, should this test break?
>
> If **yes**, the test is coupled to implementation — rewrite it.
> If **no**, the test is testing behaviour — keep it.

## Symptom: lots of mocks

Every mock is a hard-coded assertion about your internal structure. The more mocks in a test file, the more likely that file blocks future refactors.

## Symptom: test file longer than the production file

When the test file is 3x the size of the thing it tests, you are usually asserting on the *how*, not the *what*. Shrink the test; expand the production code's public contract.

## The alternative: contract tests

Test at the boundary of the module, not inside it.

\`\`\`ts
// Bad
expect(internalHelper).toHaveBeenCalledWith(42);

// Good
expect(processPayment({ amount: 42 })).toEqual({ status: "captured" });
\`\`\`

The first test breaks if you rename \`internalHelper\`. The second does not, because the caller does not care how the work got done.

## When implementation tests are fine

- You are testing a library's public API
- You are catching a *specific* past bug with a regression test
- The implementation *is* the behaviour (e.g., a sorting algorithm)

For everything else: describe inputs and expected outputs, and leave the middle alone.`,
  },
];

async function main() {
  console.log("> Resetting database ...");
  await prisma.like.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log("> Creating users ...");
  const passwordHash = await bcrypt.hash("password123", 12);
  const adminHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? "ChangeMeNow!2026",
    12
  );

  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL ?? "admin@pixeltech.dev",
      username: "admin",
      name: "PixelTech Admin",
      passwordHash: adminHash,
      role: Role.ADMIN,
      bio: "Running the place. Reach out via the contact page for partnerships.",
      avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=admin",
    },
  });

  const ada = await prisma.user.create({
    data: {
      email: "ada@pixeltech.dev",
      username: "ada",
      name: "Ada Lovelace",
      passwordHash,
      role: Role.AUTHOR,
      bio: "Staff engineer writing about frontend architecture, monorepos, and the real cost of abstractions.",
      avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=ada",
    },
  });

  const linus = await prisma.user.create({
    data: {
      email: "linus@pixeltech.dev",
      username: "linus",
      name: "Linus Park",
      passwordHash,
      role: Role.AUTHOR,
      bio: "Backend engineer. Go, Postgres, boring technology evangelist.",
      avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=linus",
    },
  });

  const grace = await prisma.user.create({
    data: {
      email: "grace@pixeltech.dev",
      username: "grace",
      name: "Grace Chen",
      passwordHash,
      role: Role.AUTHOR,
      bio: "Security + AI. Former pentester, currently shipping LLM products in production.",
      avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=grace",
    },
  });

  const reader1 = await prisma.user.create({
    data: {
      email: "reader1@example.com",
      username: "quinn",
      name: "Quinn Rivers",
      passwordHash,
      bio: "Student learning full-stack.",
      avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=quinn",
    },
  });

  const reader2 = await prisma.user.create({
    data: {
      email: "reader2@example.com",
      username: "mo",
      name: "Mo Ibrahim",
      passwordHash,
      bio: "Self-taught. Lurker turned commenter.",
      avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=mo",
    },
  });

  console.log("> Creating tags ...");
  const tagByName: Record<string, string> = {};
  for (const t of TAGS) {
    const tag = await prisma.tag.create({
      data: { name: t.name, slug: toSlug(t.name), color: t.color },
    });
    tagByName[t.name] = tag.id;
  }

  console.log("> Creating posts ...");
  const authorMap: Record<string, string> = {
    admin: admin.id,
    ada: ada.id,
    linus: linus.id,
    grace: grace.id,
  };

  const posts: { id: string; slug: string; authorId: string }[] = [];
  for (const p of POSTS) {
    const created = await prisma.post.create({
      data: {
        title: p.title,
        slug: toSlug(p.title),
        excerpt: p.excerpt,
        content: p.content,
        featured: !!p.featured,
        authorId: authorMap[p.author],
        views: Math.floor(Math.random() * 4000) + 200,
        tags: {
          create: p.tags.map((name) => ({
            tag: { connect: { id: tagByName[name] } },
          })),
        },
      },
    });
    posts.push({ id: created.id, slug: created.slug, authorId: created.authorId });
  }

  console.log("> Creating social graph ...");
  await prisma.follow.createMany({
    data: [
      { followerId: reader1.id, followingId: ada.id },
      { followerId: reader1.id, followingId: grace.id },
      { followerId: reader2.id, followingId: linus.id },
      { followerId: reader2.id, followingId: ada.id },
      { followerId: ada.id,     followingId: linus.id },
      { followerId: grace.id,   followingId: ada.id },
    ],
  });

  console.log("> Creating likes and bookmarks ...");
  for (const post of posts) {
    const likers = [reader1, reader2, ada, linus, grace].filter(
      (u) => u.id !== post.authorId && Math.random() > 0.35
    );
    for (const u of likers) {
      await prisma.like.create({ data: { userId: u.id, postId: post.id } });
    }
    if (Math.random() > 0.5) {
      await prisma.bookmark.create({ data: { userId: reader1.id, postId: post.id } });
    }
  }

  console.log("> Creating comments ...");
  for (const post of posts.slice(0, 5)) {
    const root = await prisma.comment.create({
      data: {
        postId: post.id,
        authorId: reader1.id,
        content:
          "This hit at a great time — I was literally debugging this yesterday. Saved to my reading list.",
      },
    });
    await prisma.comment.create({
      data: {
        postId: post.id,
        authorId: reader2.id,
        content:
          "Agreed, and the middleware section in particular is gold. Would love a follow-up on edge cases.",
        parentId: root.id,
      },
    });
    await prisma.comment.create({
      data: {
        postId: post.id,
        authorId: authorMap[POSTS.find(p => p.title)?.author ?? "ada"],
        content: "Thanks both — noted for the follow-up post.",
        parentId: root.id,
      },
    });
  }

  console.log("> Done.");
  console.log(`   Admin:  ${admin.email}  /  (use ADMIN_PASSWORD from .env)`);
  console.log(`   Demo:   ada@pixeltech.dev  /  password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
