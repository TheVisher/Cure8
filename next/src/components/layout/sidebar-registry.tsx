'use client';

import React from "react";

interface SidebarRegistryValue {
  setSidebar: (node: React.ReactNode) => void;
}

const SidebarRegistryContext = React.createContext<SidebarRegistryValue | undefined>(undefined);

export function SidebarRegistryProvider({
  children,
  setSidebar,
}: {
  children: React.ReactNode;
  setSidebar: (node: React.ReactNode) => void;
}) {
  const value = React.useMemo(() => ({ setSidebar }), [setSidebar]);
  return (
    <SidebarRegistryContext.Provider value={value}>
      {children}
    </SidebarRegistryContext.Provider>
  );
}

export function useSidebarRegistry() {
  const ctx = React.useContext(SidebarRegistryContext);
  if (!ctx) {
    throw new Error("useSidebarRegistry must be used within a SidebarRegistryProvider");
  }
  return ctx;
}
