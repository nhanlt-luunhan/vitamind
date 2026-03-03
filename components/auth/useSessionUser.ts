"use client";

import { useEffect, useState } from "react";
import { useOptionalAuth, useOptionalUser } from "@/components/auth/useOptionalClerk";
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
  const { isLoaded: isAuthLoaded, isSignedIn: isClerkSignedIn } = useOptionalAuth();
  const { isLoaded: isClerkUserLoaded, user: clerkUser } = useOptionalUser();
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
        // Keep the last known Clerk snapshot if bootstrap is temporarily unavailable.
      } finally {
        if (!ignore) {
          setBootstrapLoaded(true);
        }
      }
    };

    if (!isAuthLoaded) {
      return () => {
        ignore = true;
      };
    }

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
  }, [isAuthLoaded, isClerkSignedIn]);

  const clerkFallback: ClientSessionUser | null =
    isClerkSignedIn && clerkUser
      ? {
        id: clerkUser.id,
        email:
          clerkUser.primaryEmailAddress?.emailAddress ??
          clerkUser.emailAddresses[0]?.emailAddress ??
          "",
        contact_email: null,
        name: clerkUser.fullName ?? null,
        display_name: clerkUser.fullName ?? clerkUser.username ?? null,
        gid: null,
        phone: null,
        role: bootstrapUser?.role ?? null,
        status: bootstrapUser?.status ?? null,
        avatar_url: clerkUser.imageUrl ?? bootstrapUser?.avatar_url ?? null,
        updated_at: null,
      }
      : null;

  const effectiveUser = bootstrapUser ?? clerkFallback;
  const isLoaded = isAuthLoaded && (bootstrapLoaded || isClerkUserLoaded);

  return { isLoaded, isSignedIn: Boolean(effectiveUser), user: effectiveUser };
}
