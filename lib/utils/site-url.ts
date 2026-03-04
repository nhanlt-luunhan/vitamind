export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.SITE_URL ?? "https://vitamind.com";
}
