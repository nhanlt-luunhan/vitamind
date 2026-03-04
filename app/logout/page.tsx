"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOptionalClerk } from "@/components/auth/useOptionalClerk";

export default function Page() {
  const router = useRouter();
  const { signOut } = useOptionalClerk();

  useEffect(() => {
    let alive = true;

    const run = async () => {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
      }).catch(() => null);

      try {
        await signOut({ redirectUrl: "/sign-in" });
        if (!alive) return;
      } catch {
        if (!alive) return;
      }

      router.replace("/sign-in");
      if (typeof window !== "undefined") {
        window.location.replace("/sign-in");
      }
    };

    void run();
    return () => {
      alive = false;
    };
  }, [router, signOut]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--page-bg, #050d1a)",
        zIndex: 9999,
      }}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: "spin 0.9s linear infinite" }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle
          cx="18"
          cy="18"
          r="15"
          stroke="rgba(148,163,184,0.12)"
          strokeWidth="3"
        />
        <path
          d="M18 3 A15 15 0 0 1 33 18"
          stroke="url(#lg2)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="lg2" x1="18" y1="3" x2="33" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#818cf8" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
