import 'server-only';
import { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Cure8 - Curate what matters',
  description: 'Your personal bookmark manager with AI-powered metadata enrichment',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
