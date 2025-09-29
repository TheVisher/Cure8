import { NextResponse } from 'next/server';
import { prisma } from '../../../src/server/db';

export async function GET() {
  const cards = await prisma.card.findMany({
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { title, url, image, notes, tags } = body as {
    title?: string;
    url?: string;
    image?: string | null;
    notes?: string | null;
    tags?: string[];
  };

  if (!title || !url) {
    return NextResponse.json({ error: 'title and url are required' }, { status: 400 });
  }

  const tagList = Array.isArray(tags)
    ? tags
        .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
        .filter(Boolean)
    : [];

  const created = await prisma.card.create({
    data: {
      title,
      url,
      image: image || undefined,
      notes: notes || undefined,
      tags: tagList.length
        ? {
            connectOrCreate: tagList.map((name) => ({
              where: { name },
              create: { name },
            })),
          }
        : undefined,
    },
    include: { tags: true },
  });

  return NextResponse.json(created, { status: 201 });
}
