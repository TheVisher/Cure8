import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

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
      <head>
        {/* Firefox polyfills - only loads in Firefox/Zen */}
        <Script
          id="firefox-polyfills"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (navigator.userAgent.toLowerCase().includes('firefox') || 
                  navigator.userAgent.toLowerCase().includes('zen')) {
                // Firefox-specific webpack fixes
                if (!window.__webpack_require__) {
                  window.__webpack_require__ = function(id) {
                    console.warn('Firefox polyfill: webpack require fallback for', id);
                    return {};
                  };
                }
                
                if (!window.__webpack_require__.t) {
                  window.__webpack_require__.t = function(value, mode) {
                    return value;
                  };
                }
                
                // Fix originalFactory undefined errors
                const originalDefine = window.define;
                if (originalDefine) {
                  window.define = function(id, deps, factory) {
                    if (typeof factory === 'function' && !factory.call) {
                      const wrappedFactory = function(...args) {
                        return factory.apply(this, args);
                      };
                      wrappedFactory.call = factory.call || function(thisArg, ...args) {
                        return factory.apply(thisArg, args);
                      };
                      return originalDefine.call(this, id, deps, wrappedFactory);
                    }
                    return originalDefine.apply(this, arguments);
                  };
                }
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}