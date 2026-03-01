"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

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
  const { isLoaded: isAuthLoaded, isSignedIn: isClerkSignedIn } = useAuth();
  const { isLoaded: isClerkUserLoaded, user: clerkUser } = useUser();
  const [isLoaded, setLoaded] = useState(false);
  const [user, setUser] = useState<ClientSessionUser | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = () =>
      fetch("/api/auth/session", { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) return null;
          const data = await response.json();
          return (data?.user as ClientSessionUser | null) ?? null;
        })
        .then((nextUser) => {
          if (ignore) return;
          setUser(nextUser);
          setLoaded(true);
        })
        .catch(() => {
          if (ignore) return;
          setUser(null);
          setLoaded(true);
        });

    load();

    const handleRefresh = () => {
      if (ignore) return;
      setLoaded(false);
      load();
    };

    window.addEventListener("account-profile-updated", handleRefresh);

    return () => {
      ignore = true;
      window.removeEventListener("account-profile-updated", handleRefresh);
    };
  }, [isAuthLoaded, isClerkSignedIn]);

  const fallbackUser: ClientSessionUser | null =
    !user && isClerkSignedIn && clerkUser
      ? {
          id: clerkUser.id,
          email:
            clerkUser.primaryEmailAddress?.emailAddress ??
            clerkUser.emailAddresses[0]?.emailAddress ??
            "",
          contact_email: null,
          name: clerkUser.fullName ?? null,
          display_name: clerkUser.fullName ?? clerkUser.username ?? null,
          gid:
            typeof clerkUser.publicMetadata?.gid === "string"
              ? clerkUser.publicMetadata.gid
              : null,
          phone:
            typeof clerkUser.publicMetadata?.phone === "string"
              ? clerkUser.publicMetadata.phone
              : null,
          role:
            typeof clerkUser.publicMetadata?.role === "string"
              ? clerkUser.publicMetadata.role
              : null,
          status:
            typeof clerkUser.publicMetadata?.status === "string"
              ? clerkUser.publicMetadata.status
              : "active",
          avatar_url: clerkUser.imageUrl ?? null,
          updated_at: null,
        }
      : null;

  const effectiveUser = user ?? fallbackUser;
  const ready = isLoaded && isAuthLoaded && isClerkUserLoaded;

  return { isLoaded: ready, isSignedIn: Boolean(effectiveUser), user: effectiveUser };
}
