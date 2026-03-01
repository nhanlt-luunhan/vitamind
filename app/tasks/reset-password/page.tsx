import { TaskResetPassword } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function Page() {
  return <TaskResetPassword redirectUrlComplete="/" />;
}
