import { prisma } from '../src/server/db';
import { CardForm } from './_components/card-form';
import { DeleteButton } from './_components/delete-button';

function getFavicon(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}/favicon.ico`;
  } catch {
    return 'https://www.google.com/s2/favicons?domain=example.com&sz=64';
  }
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default async function Page() {
  const cards = await prisma.card.findMany({
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <main style={{ display: 'grid', gap: '2rem' }}>
      <section>
        <CardForm />
      </section>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Latest cards</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {cards.map((card) => (
            <article
              key={card.id}
              style={{
                background: '#fff',
                borderRadius: '1rem',
                padding: '1.25rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                display: 'grid',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={getFavicon(card.url)} alt="" width={32} height={32} style={{ borderRadius: '0.5rem' }} />
                <div style={{ display: 'grid', gap: '0.25rem' }}>
                  <a href={card.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: '#1d4ed8' }}>
                    {card.title}
                  </a>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{getHostname(card.url)}</span>
                </div>
              </div>

              {card.notes ? <p style={{ margin: 0, color: '#374151' }}>{card.notes}</p> : null}

              {card.tags.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {card.tags.map((tag) => (
                    <span
                      key={tag.id}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        background: '#e0e7ff',
                        color: '#3730a3',
                        fontSize: '0.75rem',
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : null}

              <div>
                <DeleteButton id={card.id} />
              </div>
            </article>
          ))}

          {cards.length === 0 && (
            <div style={{ padding: '2rem', background: '#fff', borderRadius: '1rem', textAlign: 'center', color: '#6b7280' }}>
              No cards yet. Add your first capture above.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
