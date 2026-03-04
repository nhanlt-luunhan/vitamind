export function hasClerkPublishableKeyValue(value: string | null | undefined) {
  const key = value?.trim();
  if (!key) return false;
  if (key.includes("CHANGE_ME")) return false;
  if (!(key.startsWith("pk_live_") || key.startsWith("pk_test_"))) return false;
  return true;
}

export function hasConfiguredClerkPublishableKey() {
  return hasClerkPublishableKeyValue(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}
