import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function Page() {
  return <AuthenticateWithRedirectCallback signInForceRedirectUrl="/auth/continue" />;
}
