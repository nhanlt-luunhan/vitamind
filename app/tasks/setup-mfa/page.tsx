import { TaskSetupMFA } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function Page() {
  return <TaskSetupMFA redirectUrlComplete="/" />;
}
