# PixelTech — A Computer Technology Blog

A full-featured, production-ready blog and community platform built with Next.js 15 (App Router), Prisma, Postgres, and Auth.js v5. Designed to deploy on Vercel in under 10 minutes.

![Dark theme](https://img.shields.io/badge/theme-dark-0F0F1E) ![Stack](https://img.shields.io/badge/stack-Next.js%2015%20·%20Prisma%20·%20Postgres-8B5CF6) ![License](https://img.shields.io/badge/license-MIT-06D6A0)

## Features

### Public
- **Home feed** — featured posts, latest, trending, popular tags, top authors
- **Post reader** — rich Markdown rendering with GFM + syntax-highlighted code
- **Tags** — browse all tags, tag-filtered feeds
- **Search** — case-insensitive full-text search over titles, excerpts, content
- **User profiles** — bio, avatar, posts, followers, following
- **Trending** — most liked / most viewed
- **Accessible** — semantic HTML, skip-to-content, keyboard nav, 7:1 contrast on body text, `prefers-reduced-motion` respected

### Community
- **Registration / sign-in** — email + password, bcrypt hashing (12 rounds)
- **Follow users** — build a follow graph; feed will surface posts from followed authors in future iteration
- **Like posts** — optimistic UI
- **Bookmark posts** — private bookmark list
- **Comment threads** — two-level replies, author / admin can delete
- **Write** — Markdown editor with live preview
- **Edit your own posts** — authors can update or unpublish

### Admin panel (`/admin`)
- **Dashboard** — KPIs (users, posts, comments, likes), recent activity, most viewed
- **Users** — role management (USER / AUTHOR / ADMIN), ban / unban, delete
- **Posts** — feature / unfeature, publish / unpublish, edit, delete, filter by draft / featured, search
- **Comments** — hide / unhide, delete, filter hidden
- **Tags** — create, edit (name + color), delete

### Tech stack
- **Next.js 15** App Router, Server Components, Server Actions
- **TypeScript** end to end
- **Prisma** ORM + **Postgres** (Neon via Vercel Marketplace recommended)
- **Auth.js v5** (NextAuth) with JWT sessions, Credentials provider, middleware-based gates
- **Tailwind CSS** with a custom dark-first design system
- **next/font** for zero-CLS Inter + JetBrains Mono loading
- **react-markdown** + `remark-gfm` + `rehype-highlight`
- **Zod** for all form validation

## Local development

### Prerequisites
- **Node.js 20+**
- **pnpm** or **npm**
- A **Postgres** database — easiest path is a free [Neon](https://neon.tech) project, or Postgres in Docker

### Setup

```bash
# 1. Install
npm install

# 2. Env vars
cp .env.example .env
# then edit .env: set DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Initialize schema
npx prisma db push

# 4. Seed demo content (users, posts, tags, comments)
npm run db:seed

# 5. Run
npm run dev
```

Open <http://localhost:3000>.

**Demo credentials (after seed):**
- Admin — `admin@pixeltech.dev` / the `ADMIN_PASSWORD` in your `.env`
- Author — `ada@pixeltech.dev` / `password123`

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create pixeltech-blog --public --source=. --push
# or create a repo on github.com and: git remote add origin <url> && git push -u origin main
```

### 2. Import the repo on Vercel

- Go to <https://vercel.com/new>
- Import your GitHub repo
- Framework preset: **Next.js** (auto-detected)
- **Do not click Deploy yet** — add env vars first

### 3. Attach a Postgres from the Marketplace (Neon recommended)

- From the Vercel project → **Storage** → **Create → Neon Postgres**
- This auto-sets `DATABASE_URL` in your project environment
- Alternatively, paste a connection string from any Postgres provider

### 4. Add the remaining env vars

In the Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `AUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `AUTH_URL` | `https://<your-project>.vercel.app` |
| `ADMIN_EMAIL` | e.g. `admin@pixeltech.dev` |
| `ADMIN_PASSWORD` | A strong password you will remember |

Set all four for **Production, Preview, and Development**.

### 5. Deploy

Click **Deploy**. The build will:

1. Install dependencies
2. Generate the Prisma client
3. Run `prisma db push` against your Neon DB (creates tables)
4. Build Next.js

### 6. Seed the database (one time, after first deploy)

The seed script is **not** part of `vercel build`. Run it once against your Neon DB:

```bash
# from your local machine
DATABASE_URL="<paste Neon production URL from Vercel>" \
ADMIN_EMAIL="<same as Vercel>" \
ADMIN_PASSWORD="<same as Vercel>" \
npm run db:seed
```

After that, visit your site, sign in as the admin, and you can immediately create real posts — the seed is optional. If you don't want demo content, skip this step; the `ADMIN_EMAIL` / `ADMIN_PASSWORD` user will still be created the first time you hit `/register` (or you can run a stripped-down seed).

> If you prefer never to seed demo data: log into Vercel → Storage → Neon → Query → create your admin user manually with a hashed password (use `bcrypt.hash("yourpass", 12)` in a throw-away node script).

### 7. You're live

- `/` — blog home
- `/register` — create an account
- `/write` — publish a post
- `/admin` — admin panel (only for users with `role = ADMIN`)

## Repository tour

```
app/
  (public pages)
  login/  register/  write/  bookmarks/  settings/
  posts/[slug]/        # post reader
  posts/[slug]/edit/   # post editor
  u/[username]/        # user profile
  tags/                # tag index + tag/[slug] pages
  trending/            # trending feed
  search/              # search
  admin/               # admin layout + dashboard + users/posts/comments/tags
  actions/             # all server actions (auth, posts, comments, social, admin, settings)
  api/auth/[...nextauth]/ # Auth.js route handlers

components/
  site-header.tsx      # sticky nav with auth-aware right side
  site-footer.tsx
  user-menu.tsx        # client dropdown
  post-card.tsx        # home / profile / tag feeds
  markdown.tsx         # read-only renderer
  markdown-editor.tsx  # write + live preview tabs
  comment-thread.tsx   # nested comments with reply + moderate
  post-actions.tsx     # like + bookmark (optimistic)
  follow-button.tsx    # follow/unfollow (optimistic)
  tag-pill.tsx
  empty.tsx

lib/
  db.ts                # Prisma singleton
  auth.ts              # Auth.js v5 config
  auth-route.ts        # exports GET/POST handlers
  utils.ts             # cn, slug, timeAgo, readingTime, avatar fallback

prisma/
  schema.prisma        # User / Post / Tag / Comment / Like / Bookmark / Follow
  seed.ts              # demo users, posts, tags, comments, likes, follows

middleware.ts          # gates /write, /admin, /settings, /bookmarks
```

## Security notes

- Passwords are hashed with `bcryptjs` at **12 rounds** — the 2026 recommendation.
- Sessions are JWTs (works cleanly on serverless). If you need revocation, add a `tokenVersion` column and check it in the `jwt` callback.
- Admin actions all go through `requireAdmin()` in `app/actions/admin.ts` so the role gate exists at two layers (middleware + action).
- `AUTH_SECRET` must be kept secret. Rotate it only when you are willing to log everyone out.

## Accessibility

Target: **WCAG 2.1 AA** across the whole site, AAA on body-text contrast and heading structure. See `/accessibility` for the public statement.

## License

MIT — do whatever you want, just keep the notice.
