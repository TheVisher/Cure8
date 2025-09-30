import { prisma } from '@/src/server/db';

export async function GET() {
  const items = await prisma.card.findMany({
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return Response.json({ items });
}

export async function POST(req: Request) {
  const { title, url, image, notes, tags = [] } = await req.json();
  const created = await prisma.card.create({
    data: {
      title, url, image, notes,
      tags: {
        connectOrCreate: (tags as string[]).map(name => ({
          where: { name },
          create: { name }
        })),
      },
    },
    include: { tags: true },
  });
  return Response.json(created, { status: 201 });
}
