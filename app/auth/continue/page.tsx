import { redirect } from "next/navigation";
import { getSessionUser, getSignedInDestination } from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in");
  }

  redirect(getSignedInDestination(user));
}
