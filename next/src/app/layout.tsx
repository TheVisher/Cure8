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
        {/* Aggressive Firefox polyfills - loads immediately */}
        <Script
          id="firefox-polyfills"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (navigator.userAgent.toLowerCase().includes('firefox') || 
                    navigator.userAgent.toLowerCase().includes('zen')) {
                  console.log('Firefox/Zen detected - applying aggressive polyfills');
                  
                  // Override webpack module loading completely for Firefox
                  const originalWebpackRequire = window.__webpack_require__;
                  
                  // Create a robust webpack require function
                  window.__webpack_require__ = function(id) {
                    try {
                      if (originalWebpackRequire) {
                        return originalWebpackRequire.call(this, id);
                      }
                    } catch (e) {
                      console.warn('Firefox polyfill: webpack require fallback for', id, e);
                    }
                    return {};
                  };
                  
                  // Ensure webpack require has all necessary properties
                  if (window.__webpack_require__) {
                    window.__webpack_require__.t = function(value, mode) {
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
                  
                  // Fix AMD define function
                  const originalDefine = window.define;
                  if (originalDefine) {
                    window.define = function(id, deps, factory) {
                      // Ensure factory is always a function with call method
                      if (typeof factory === 'function') {
                        if (!factory.call) {
                          const originalFactory = factory;
                          factory = function(...args) {
                            return originalFactory.apply(this, args);
                          };
                          // Copy all properties
                          Object.setPrototypeOf(factory, originalFactory);
                          Object.assign(factory, originalFactory);
                          // Ensure call method exists
                          factory.call = function(thisArg, ...args) {
                            return originalFactory.apply(thisArg, args);
                          };
                        }
                      } else if (factory && typeof factory === 'object') {
                        // Handle object factories
                        const objFactory = factory;
                        factory = function() {
                          return objFactory;
                        };
                        factory.call = function() {
                          return objFactory;
                        };
                      } else {
                        // Handle other cases
                        const value = factory;
                        factory = function() {
                          return value;
                        };
                        factory.call = function() {
                          return value;
                        };
                      }
                      
                      return originalDefine.call(this, id, deps, factory);
                    };
                  }
                  
                  // Override webpack module options to prevent undefined factory errors
                  const originalModule = window.__webpack_require__ && window.__webpack_require__.m;
                  if (originalModule) {
                    const moduleProxy = new Proxy(originalModule, {
                      get(target, prop) {
                        const module = target[prop];
                        if (module && typeof module === 'function') {
                          // Ensure module function has call method
                          if (!module.call) {
                            const originalModule = module;
                            const wrappedModule = function(...args) {
                              return originalModule.apply(this, args);
                            };
                            Object.setPrototypeOf(wrappedModule, originalModule);
                            Object.assign(wrappedModule, originalModule);
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
                  
                  console.log('Aggressive Firefox polyfills applied');
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