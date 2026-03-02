"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    async function finishLogin() {
      try {
        const res = await fetch("/api/auth/clerk-continue");
        if (res.ok) {
          const data = (await res.json()) as { destination?: string };
          window.location.assign(data.destination ?? "/");
          return;
        }
      } catch {
        // fall through
      }
      // If clerk-continue fails (no Clerk session), try reading existing session
      window.location.assign("/");
    }
    finishLogin();
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <p style={{ font: "var(--font-sans)", color: "var(--page-text-muted)" }}>Đang chuyển hướng...</p>
    </div>
  );
}
