"use client";

import { useEffect, useState } from "react";
import type { BootstrapPayload } from "@/lib/auth/bootstrap";

export type ClientSessionUser = {
  id: string;
  email: string;
  contact_email: string | null;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  phone: string | null;
  role: string | null;
  status: string | null;
  avatar_url: string | null;
  updated_at: string | null;
};

export function useSessionUser() {
  const [bootstrapUser, setBootstrapUser] = useState<ClientSessionUser | null>(null);
  const [bootstrapLoaded, setBootstrapLoaded] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadBootstrap = async () => {
      try {
        const response = await fetch("/api/bootstrap", { cache: "no-store" });
        if (ignore) return;
        if (response.status === 401) {
          setBootstrapUser(null);
          return;
        }
        if (!response.ok) return;

        const data = await response.json();
        const bootstrap = (data?.bootstrap as BootstrapPayload | null) ?? null;
        if (ignore) return;

        if (bootstrap) {
          setBootstrapUser({
            id: bootstrap.userId,
            email: bootstrap.profile.email,
            contact_email: bootstrap.profile.contactEmail,
            name: bootstrap.profile.name,
            display_name: bootstrap.profile.displayName,
            gid: bootstrap.profile.gid,
            phone: bootstrap.profile.phone,
            role: bootstrap.role,
            status: bootstrap.accountStatus.status,
            avatar_url: bootstrap.profile.avatar,
            updated_at: bootstrap.updatedAt,
          });
        } else {
          setBootstrapUser(null);
        }
      } catch {
        // Keep the last known internal snapshot if bootstrap is temporarily unavailable.
      } finally {
        if (!ignore) {
          setBootstrapLoaded(true);
        }
      }
    };

    setBootstrapLoaded(false);
    void loadBootstrap();

    const handleRefresh = () => {
      if (!ignore) {
        void loadBootstrap();
      }
    };

    window.addEventListener("account-profile-updated", handleRefresh);

    return () => {
      ignore = true;
      window.removeEventListener("account-profile-updated", handleRefresh);
    };
  }, []);

  return { isLoaded: bootstrapLoaded, isSignedIn: Boolean(bootstrapUser), user: bootstrapUser };
}
