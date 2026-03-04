"use client";

import {
  useAuth as useClerkAuth,
  useClerk as useClerkClient,
  useSignIn as useClerkSignIn,
  useSignUp as useClerkSignUp,
  useUser as useClerkUser,
} from "@clerk/nextjs";

const authFallback = {
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  sessionId: null,
  sessionClaims: null,
  actor: null,
  orgId: null,
  orgRole: null,
  orgSlug: null,
  has: () => false,
  getToken: async () => null,
  signOut: async () => undefined,
} as unknown as ReturnType<typeof useClerkAuth>;

const userFallback = {
  isLoaded: true,
  isSignedIn: false,
  user: null,
} as unknown as ReturnType<typeof useClerkUser>;

const signInFallback = {
  isLoaded: false,
  signIn: null,
  setActive: async () => undefined,
} as unknown as ReturnType<typeof useClerkSignIn>;

const signUpFallback = {
  isLoaded: false,
  signUp: null,
  setActive: async () => undefined,
} as unknown as ReturnType<typeof useClerkSignUp>;

const clerkFallback = {
  client: null,
  session: null,
  user: null,
  organization: null,
  signOut: async () => undefined,
  openSignIn: () => undefined,
  openSignUp: () => undefined,
  redirectToSignIn: () => undefined,
  redirectToSignUp: () => undefined,
} as unknown as ReturnType<typeof useClerkClient>;

export function useOptionalAuth() {
  try {
    return useClerkAuth();
  } catch {
    return authFallback;
  }
}

export function useOptionalUser() {
  try {
    return useClerkUser();
  } catch {
    return userFallback;
  }
}

export function useOptionalSignIn() {
  try {
    return useClerkSignIn();
  } catch {
    return signInFallback;
  }
}

export function useOptionalSignUp() {
  try {
    return useClerkSignUp();
  } catch {
    return signUpFallback;
  }
}

export function useOptionalClerk() {
  try {
    return useClerkClient();
  } catch {
    return clerkFallback;
  }
}
