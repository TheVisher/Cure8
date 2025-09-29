# Deploy & Environment Notes

## Local Development
1. Copy `.env.example` to `.env.local` and fill `NEXT_PUBLIC_BASE_URL` + `DATABASE_URL`.
2. Install dependencies: `pnpm install`.
3. Generate the Prisma client: `pnpm prisma:generate`.
4. Apply migrations locally: `pnpm prisma migrate dev --name init`.
5. Start the dev server: `pnpm dev`.
6. Visit `/`, add a card, refresh, and remove it to confirm CRUD works.

## Vercel Deployment
```bash
# Login and link
pnpm dlx vercel@latest login
pnpm dlx vercel link

# Configure environment (set for Preview + Production)
pnpm dlx vercel env add NEXT_PUBLIC_BASE_URL
pnpm dlx vercel env add DATABASE_URL

# Deploy
pnpm dlx vercel         # preview
pnpm dlx vercel deploy --prod
```

> The default `pnpm build` now calls `pnpm vercel-build`, which runs `prisma generate`, `prisma migrate deploy`, and finally `next build` to ensure the database schema is in sync before the bundle step.
