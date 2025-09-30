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
        {/* Refined Firefox polyfills - less aggressive, more targeted */}
        <Script
          id="firefox-polyfills"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (navigator.userAgent.toLowerCase().includes('firefox') || 
                    navigator.userAgent.toLowerCase().includes('zen')) {
                  console.log('Firefox/Zen detected - applying refined polyfills');
                  
                  // Store original functions to avoid interference
                  const originalWebpackRequire = window.__webpack_require__;
                  const originalDefine = window.define;
                  
                  // Only patch if webpack require doesn't exist or is broken
                  if (!window.__webpack_require__ || !window.__webpack_require__.t) {
                    window.__webpack_require__ = function(id) {
                      try {
                        if (originalWebpackRequire) {
                          return originalWebpackRequire.call(this, id);
                        }
                      } catch (e) {
                        console.warn('Firefox polyfill: webpack require fallback for', id);
                      }
                      return {};
                    };
                    
                    // Add minimal required properties
                    if (window.__webpack_require__) {
                      window.__webpack_require__.t = function(value, mode) {
                        return value;
                      };
                      window.__webpack_require__.m = window.__webpack_require__.m || {};
                      window.__webpack_require__.c = window.__webpack_require__.c || {};
                    }
                  }
                  
                  // Only patch define if it exists and needs fixing
                  if (originalDefine) {
                    const originalDefineCall = originalDefine.call;
                    window.define = function(id, deps, factory) {
                      // Only wrap if factory is a function without call method
                      if (typeof factory === 'function' && !factory.call) {
                        const originalFactory = factory;
                        const wrappedFactory = function(...args) {
                          return originalFactory.apply(this, args);
                        };
                        // Minimal property copying to avoid interference
                        wrappedFactory.call = function(thisArg, ...args) {
                          return originalFactory.apply(thisArg, args);
                        };
                        return originalDefineCall.call(this, id, deps, wrappedFactory);
                      }
                      return originalDefineCall.call(this, id, deps, factory);
                    };
                  }
                  
                  console.log('Refined Firefox polyfills applied');
                }
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}