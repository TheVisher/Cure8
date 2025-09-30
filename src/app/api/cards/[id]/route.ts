import { prisma } from '@/src/server/db';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.card.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
