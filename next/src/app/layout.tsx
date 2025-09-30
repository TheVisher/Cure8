import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Cure8",
  description: "Curate what matters most today.",
  openGraph: {
    title: "Cure8",
    description: "Curate what matters most today.",
    url: baseUrl,
    siteName: "Cure8",
    images: [
      {
        url: "/logo512.png",
        width: 512,
        height: 512,
        alt: "Cure8 logo",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
