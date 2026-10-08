"use client";

import dynamic from "next/dynamic";

const ConsentModal = dynamic(() => import("./ConsentModal"), { ssr: false });
const Toaster = dynamic(() => import("sonner").then((module) => module.Toaster), {
  ssr: false,
});

export default function ClientOverlays() {
  return (
    <>
      <ConsentModal />
      <Toaster position="top-right" richColors />
    </>
  );
}
