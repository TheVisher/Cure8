# Dev Checklist

- [ ] Create `.env.local` with `NEXT_PUBLIC_BASE_URL` and `DATABASE_URL`.
- [ ] Run `pnpm prisma:generate` to create the Prisma client.
- [ ] Run `pnpm prisma migrate dev --name init` to create the initial schema.
- [ ] Start the app with `pnpm dev`.
- [ ] Visit `/`, create a card, refresh, and delete it to confirm CRUD behaves.
