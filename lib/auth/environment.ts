export function isSharedClerkMode() {
  return process.env.SHARED_CLERK_MODE === "true";
}

export function isProtectedSharedClerkMode() {
  return isSharedClerkMode() && process.env.PROTECT_SHARED_IDENTITY_FIELDS !== "false";
}
