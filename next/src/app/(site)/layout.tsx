'use client';

import React from "react";
import "../globals.css";
import { AppShell } from "@/components/AppShell";
import { SidebarRegistryProvider } from "@/components/layout/sidebar-registry";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebar, setSidebar] = React.useState<React.ReactNode>(null);

  return (
    <SidebarRegistryProvider setSidebar={setSidebar}>
      <AppShell sidebar={sidebar}>{children}</AppShell>
    </SidebarRegistryProvider>
  );
}
