import { getSessionUser } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/rbac";
import { query } from "@/lib/db/admin-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type UserPreviewRow = {
  id: string;
  email: string;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  role: string | null;
  status: string | null;
  updated_at: string | null;
  created_at: string;
};

const STREAM_POLL_MS = 2000;
const KEEPALIVE_MS = 15000;

async function loadUsersPreview() {
  return query<UserPreviewRow>(
    `select id,
            email,
            name,
            display_name,
            gid,
            role,
            status,
            updated_at,
            created_at
     from users
     order by coalesce(updated_at, created_at) desc, created_at desc
     limit 8`,
  );
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!canManageUsers(user)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let lastSignature = "";
      let closed = false;

      const sendEvent = (event: string, payload: unknown) => {
        if (closed) return;
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`),
        );
      };

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(snapshotTimer);
        clearInterval(heartbeatTimer);
        controller.close();
      };

      const pushSnapshot = async (force = false) => {
        const { rows, error } = await loadUsersPreview();
        if (error) {
          sendEvent("problem", { error });
          return;
        }

        const signature = JSON.stringify(
          rows.map((row) => [
            row.id,
            row.email,
            row.name,
            row.display_name,
            row.gid,
            row.role,
            row.status,
            row.updated_at,
            row.created_at,
          ]),
        );

        if (!force && signature === lastSignature) {
          return;
        }

        lastSignature = signature;
        sendEvent("users", {
          users: rows,
          streamed_at: new Date().toISOString(),
        });
      };

      const snapshotTimer = setInterval(() => {
        void pushSnapshot(false);
      }, STREAM_POLL_MS);

      const heartbeatTimer = setInterval(() => {
        if (closed) return;
        controller.enqueue(encoder.encode(`: keepalive ${Date.now()}\n\n`));
      }, KEEPALIVE_MS);

      void pushSnapshot(true);
      request.signal.addEventListener("abort", close);
    },
    cancel() {
      // The request abort handler closes timers and stream.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
