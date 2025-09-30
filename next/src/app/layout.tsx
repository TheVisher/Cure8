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
        {/* Targeted Firefox polyfills - focused on the specific error */}
        <Script
          id="firefox-polyfills"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (navigator.userAgent.toLowerCase().includes('firefox') || 
                    navigator.userAgent.toLowerCase().includes('zen')) {
                  console.log('Firefox/Zen detected - applying targeted polyfills');
                  
                  // Store original functions
                  const originalWebpackRequire = window.__webpack_require__;
                  const originalDefine = window.define;
                  
                  // Ensure webpack require exists and has required properties
                  if (!window.__webpack_require__) {
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
                  }
                  
                  // Add essential webpack require properties
                  if (window.__webpack_require__) {
                    window.__webpack_require__.t = window.__webpack_require__.t || function(value, mode) {
                      return value;
                    };
                    window.__webpack_require__.m = window.__webpack_require__.m || {};
                    window.__webpack_require__.c = window.__webpack_require__.c || {};
                    window.__webpack_require__.d = window.__webpack_require__.d || function(exports, name, getter) {
                      if (!window.__webpack_require__.o(exports, name)) {
                        Object.defineProperty(exports, name, { enumerable: true, get: getter });
                      }
                    };
                    window.__webpack_require__.o = window.__webpack_require__.o || function(obj, prop) {
                      return Object.prototype.hasOwnProperty.call(obj, prop);
                    };
                  }
                  
                  // Fix AMD define function - specifically target the factory issue
                  if (originalDefine) {
                    const originalDefineCall = originalDefine.call;
                    window.define = function(id, deps, factory) {
                      // Ensure factory is always a function with call method
                      if (typeof factory === 'function') {
                        if (!factory.call) {
                          const originalFactory = factory;
                          const wrappedFactory = function(...args) {
                            return originalFactory.apply(this, args);
                          };
                          // Ensure call method exists
                          wrappedFactory.call = function(thisArg, ...args) {
                            return originalFactory.apply(thisArg, args);
                          };
                          return originalDefineCall.call(this, id, deps, wrappedFactory);
                        }
                      } else if (factory && typeof factory === 'object') {
                        // Handle object factories
                        const objFactory = factory;
                        const wrappedFactory = function() {
                          return objFactory;
                        };
                        wrappedFactory.call = function() {
                          return objFactory;
                        };
                        return originalDefineCall.call(this, id, deps, wrappedFactory);
                      } else if (factory === undefined || factory === null) {
                        // Handle undefined/null factories
                        const wrappedFactory = function() {
                          return {};
                        };
                        wrappedFactory.call = function() {
                          return {};
                        };
                        return originalDefineCall.call(this, id, deps, wrappedFactory);
                      }
                      return originalDefineCall.call(this, id, deps, factory);
                    };
                  }
                  
                  // Intercept webpack module loading to fix options.factory issues
                  if (window.__webpack_require__ && window.__webpack_require__.m) {
                    const originalModule = window.__webpack_require__.m;
                    const moduleProxy = new Proxy(originalModule, {
                      get(target, prop) {
                        const module = target[prop];
                        if (module && typeof module === 'function') {
                          // Wrap module functions to ensure they have call method
                          if (!module.call) {
                            const originalModule = module;
                            const wrappedModule = function(...args) {
                              return originalModule.apply(this, args);
                            };
                            wrappedModule.call = function(thisArg, ...args) {
                              return originalModule.apply(thisArg, args);
                            };
                            return wrappedModule;
                          }
                        }
                        return module;
                      }
                    });
                    window.__webpack_require__.m = moduleProxy;
                  }
                  
                  console.log('Targeted Firefox polyfills applied');
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