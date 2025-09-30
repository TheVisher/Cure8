import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/server/db';

// GET all bookmarks
export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      include: { tags: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(cards);
  } catch (error) {
    console.error('Failed to fetch bookmarks:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

// POST new bookmark
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, domain, image, description, notes, state } = body;

    const card = await prisma.card.create({
      data: {
        title: title || url,
        url,
        domain: domain || null,
        image: image || null,
        description: description || null,
        notes: notes || null,
        state: state || 'ok',
      },
      include: { tags: true },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('Failed to create bookmark:', error);
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
}