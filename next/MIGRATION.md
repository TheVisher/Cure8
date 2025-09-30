# Cure8 Next.js Migration

## Project layout
- `src/app/(site)/layout.tsx` wraps the entire app shell using `AppShell` and the sidebar registry.
- `src/app/(site)/page.tsx` renders the dashboard content inside a suspense boundary.
- `src/app/api/cards/` contains the Prisma-backed card API handlers (`route.ts` and `[id]/route.ts`).
- `src/components/` mirrors the previous React components (AppShell, Sidebar, Card) and remains client components.
- `src/screens/` keeps the feature screens (Grid, Home, Settings) now wired for Next.js client execution.
- `src/lib/` centralises helpers (`env.ts`, Supabase clients) and `src/server/` contains Prisma helpers.
- `types/` holds ambient module declarations for the JS components and Supabase metadata shims.

## Developing
- Install dependencies: `cd next && pnpm install`.
- Run dev server: `pnpm dev` (served at `http://localhost:3000`).
- Lint: `pnpm lint` (uses the flat ESLint config in `eslint.config.mjs`).
- Build: `pnpm build` (requires Prisma `.env` values as described below).

## Routing & App Router
- Place new routes under `src/app`. Use nested route groups (e.g. `(admin)/page.tsx`) to share shells.
- Client components that need router hooks must include `'use client';` and can import from `next/navigation`.
- Query-string state is synchronised via `useSearchParams` in `GridScreen`. Wrap additional hook usage in `<Suspense>` blocks in pages.

## Supabase & Prisma
- Environment template: `.env.example` lists `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`.
- Browser client: `src/lib/supabase/client.ts` (uses the public URL + anon key).
- Server client: `src/lib/supabase/server.ts` (service role key, ensure it is only loaded server-side).
- Prisma client: `src/server/db.ts` (singleton in development).
- Prisma schema: `prisma/schema.prisma` (copied from the CRA project with description/domain/status/metadata fields).

## Cards API
- Collection endpoint: `src/app/api/cards/route.ts` exposes `GET`, `POST`, `DELETE` for listing, creating, clearing cards.
- Item endpoint: `src/app/api/cards/[id]/route.ts` exposes `PATCH`, `DELETE` for updates & removal.
- Server helpers live in `src/server/cards.ts`; they map Prisma models to UI-ready payloads.
- The grid screen now syncs against these routes instead of `localStorage`.

## Client data flow
- Bookmarks load via `GET /api/cards` on mount.
- Legacy `localStorage` data (under `cure8.bookmarks`) is auto-imported on first run if the database is empty.
- CRUD operations call the API routes and optimistically update state.
- Query params `view`, `q`, `layout` are kept in sync for deep linking.

## Styling & assets
- Existing CSS lives under `src/styles` and is imported through `globals.css` in `(site)/layout.tsx`.
- Tailwind config is converted to JavaScript (`tailwind.config.js`); the project still relies on the original handcrafted CSS for the UI.
- Static assets and public files were copied into `next/public` (including the legacy `Media/` directory).

## Environment requirements
- Provide real Supabase + Postgres values in `.env.local` (not committed).
- The build step expects `DATABASE_URL` to be defined; during local work you can export stub values if needed: `DATABASE_URL=postgresql://... pnpm build`.
- Remember to add the same env vars in Vercel (mark client keys as "exposed to browser").

## Adding new routes/components
1. Drop new React components into `src/components` or `src/screens` (use `'use client';` if they need hooks).
2. Create the corresponding App Router entry under `src/app/.../page.tsx`. For client-heavy pages wrap them in `<Suspense>`.
3. For server logic, add modules under `src/server` and call them from route handlers in `src/app/api/*`.
4. Update `MIGRATION.md` (this file) when structural changes are made.

## Notes
- ESLint runs via the flat config in `eslint.config.mjs`. Next.js warns that the core plugin is not detected; this is expected because we replaced `next lint` with a custom setup but preserved the core rules.
- All legacy CRA code remains in the repository untouched for reference. The new Next.js app lives entirely under `next/`.
