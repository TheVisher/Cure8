import { NextResponse } from 'next/server';
import { prisma } from '../../../../src/server/db';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function DELETE(_: Request, { params }: RouteParams) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    await prisma.card.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }
}
