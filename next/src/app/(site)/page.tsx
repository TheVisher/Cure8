'use client';

import React, { Suspense } from "react";
import GridScreen from "@/screens/Grid";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading...</div>}>
      <GridScreen />
    </Suspense>
  );
}
