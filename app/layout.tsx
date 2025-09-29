import 'server-only';
import { ReactNode } from 'react';
import { assertServerEnv } from '../src/lib/env';

assertServerEnv();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, background: '#f5f5f5', color: '#111' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>{children}</div>
      </body>
    </html>
  );
}
