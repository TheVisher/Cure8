import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/server/db';

// GET single bookmark
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const card = await prisma.card.findUnique({
      where: { id: params.id },
      include: { tags: true },
    });

    if (!card) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error('Failed to fetch bookmark:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmark' }, { status: 500 });
  }
}

// PATCH update bookmark
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, url, domain, image, description, notes, state } = body;

    const card = await prisma.card.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(url !== undefined && { url }),
        ...(domain !== undefined && { domain }),
        ...(image !== undefined && { image }),
        ...(description !== undefined && { description }),
        ...(notes !== undefined && { notes }),
        ...(state !== undefined && { state }),
      },
      include: { tags: true },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error('Failed to update bookmark:', error);
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}

// DELETE bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.card.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete bookmark:', error);
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}