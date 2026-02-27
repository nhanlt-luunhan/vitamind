import type { SessionUser } from "@/lib/auth/admin-auth";

export type Role = "admin" | "editor" | "viewer";

const ROLE_RANK: Record<Role, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
};

export function normalizeRole(role: string | null | undefined): Role {
  if (role === "admin" || role === "editor" || role === "viewer") {
    return role;
  }
  return "viewer";
}

export function hasRole(user: SessionUser | null, minRole: Role) {
  if (!user) return false;
  const current = normalizeRole(user.role);
  return ROLE_RANK[current] >= ROLE_RANK[minRole];
}

export const canManageUsers = (user: SessionUser | null) => hasRole(user, "admin");
export const canManageProducts = (user: SessionUser | null) => hasRole(user, "editor");
export const canManageOrders = (user: SessionUser | null) => hasRole(user, "admin");
export const canManageBlog = (user: SessionUser | null) => hasRole(user, "editor");
export const canManageMedia = (user: SessionUser | null) => hasRole(user, "editor");

