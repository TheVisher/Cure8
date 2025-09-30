// Firefox-specific polyfills for webpack module loading issues
if (typeof window !== 'undefined') {
  // Detect Firefox/Zen Browser
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox') || 
                   navigator.userAgent.toLowerCase().includes('zen');
  
  if (isFirefox) {
    // Polyfill for webpack module loading issues
    if (!window.__webpack_require__) {
      window.__webpack_require__ = (id: any) => {
        console.warn('Firefox polyfill: webpack require fallback for', id);
        return {};
      };
    }
    
    // Ensure proper module resolution
    if (!window.__webpack_require__.t) {
      window.__webpack_require__.t = (value: any, mode: any) => {
        return value;
      };
    }
    
    // Fix for originalFactory undefined errors
    const originalDefine = (window as any).define;
    if (originalDefine) {
      (window as any).define = function(id: string, deps: string[], factory: any) {
        if (typeof factory === 'function' && !factory.call) {
          // Wrap factory to ensure it has a call method
          const wrappedFactory = function(...args: any[]) {
            return factory.apply(this, args);
          };
          wrappedFactory.call = factory.call || function(thisArg: any, ...args: any[]) {
            return factory.apply(thisArg, args);
          };
          return originalDefine.call(this, id, deps, wrappedFactory);
        }
        return originalDefine.apply(this, arguments);
      };
    }
  }
}

export {};
