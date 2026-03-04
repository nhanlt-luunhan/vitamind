"use client";

import { useEffect } from "react";
import type { BootstrapPayload } from "@/lib/auth/bootstrap";

export const dynamic = "force-dynamic";

export default function Page() {
  useEffect(() => {
    async function finishLogin() {
      try {
        const res = await fetch("/api/bootstrap", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { bootstrap?: BootstrapPayload | null };
          window.location.assign(data.bootstrap?.redirectTo ?? "/");
          return;
        }
      } catch {
        // fall through
      }
      window.location.assign("/");
    }
    finishLogin();
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      gap: "20px",
      background: "var(--page-bg, #050d1a)",
    }}>
      {/* Spinner */}
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
          stroke="rgba(148,163,184,0.14)"
          strokeWidth="3"
        />
        <path
          d="M18 3 A15 15 0 0 1 33 18"
          stroke="url(#sg)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="sg" x1="18" y1="3" x2="33" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#818cf8" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
