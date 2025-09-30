import { assertServerEnv } from '@/src/lib/env';
import './globals.css';
assertServerEnv();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
