"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShieldAlert, Mail, Phone } from "lucide-react";

export default function VisitorTracker() {
  const pathname = usePathname();
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    // Skip tracking for admin console
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    let mounted = true;

    async function recordVisit() {
      try {
        const res = await fetch("/api/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            referrer: typeof document !== "undefined" ? document.referrer : "",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (mounted && data.restricted) {
            setIsRestricted(true);
          }
        }
      } catch {
        // Silently handle offline/fetch issues
      }
    }

    recordVisit();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  if (!isRestricted) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-stone-900 border border-red-200 dark:border-red-900/40 animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 mb-5">
          <ShieldAlert size={36} />
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="mt-3 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          Your access to the Bhatia Stores website and ordering services has been restricted by the store administrator.
        </p>
        <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-300 space-y-2 border border-stone-200 dark:border-stone-700">
          <p className="font-semibold text-stone-900 dark:text-white">Need help or believe this is a mistake?</p>
          <div className="flex items-center justify-center gap-2">
            <Mail size={13} className="text-[#b49663]" />
            <a href="mailto:info@bhatiastores.com" className="font-bold underline text-[#b49663]">
              info@bhatiastores.com
            </a>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Phone size={13} className="text-[#b49663]" />
            <a href="tel:+919120435950" className="font-bold text-[#b49663]">
              +91 91204 35950
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
