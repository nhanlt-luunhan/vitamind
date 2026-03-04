"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const run = async () => {
      await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => undefined);
      window.location.replace("/");
    };

    run();
  }, []);

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
