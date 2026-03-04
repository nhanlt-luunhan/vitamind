import { CustomSignUp } from "@/components/auth/CustomSignUp";
import { getSessionUser, getSignedInDestination } from "@/lib/auth/admin-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getSessionUser();
  if (user) {
    redirect(getSignedInDestination(user));
  }
  return <CustomSignUp />;
}
