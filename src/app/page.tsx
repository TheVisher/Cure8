import { prisma } from '@/src/server/db';
import CardForm from './_components/CardForm';
import DeleteButton from './_components/DeleteButton';

export default async function Page() {
  const cards = await prisma.card.findMany({
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <main style={{ display: 'grid', gap: '2rem', padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
      <section>
        <h1>Cards</h1>
        <CardForm />
      </section>
      <section>
        <h2>Latest</h2>
        <ul style={{ display: 'grid', gap: '1rem', listStyle: 'none', padding: 0 }}>
          {cards.map(card => (
            <li key={card.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: '1rem', display: 'grid', gap: '0.5rem' }}>
              <div>
                <strong>{card.title}</strong>
              </div>
              <a href={card.url} target="_blank" rel="noreferrer">
                {card.url}
              </a>
              {card.image ? <img src={card.image} alt={card.title} style={{ maxWidth: '100%', borderRadius: 4 }} /> : null}
              {card.notes ? <p>{card.notes}</p> : null}
              {card.tags.length ? (
                <p style={{ fontSize: '0.85rem', color: '#555' }}>
                  Tags: {card.tags.map(tag => tag.name).join(', ')}
                </p>
              ) : null}
              <DeleteButton id={card.id} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
