"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import shellStyles from "@/components/admin/AdminShell.module.css";

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

type ImportResult = {
  imported?: number;
  failed?: number;
  errors?: Array<{ index: number; error: string }>;
};

type StreamPayload = {
  users?: UserPreviewRow[];
  streamed_at?: string;
  error?: string;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
};

async function fetchUsersPreview() {
  const response = await fetch("/api/admin/users?sync=0&limit=8", {
    method: "GET",
    cache: "no-store",
  });
  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : {};

  if (!response.ok) {
    throw new Error(
      (data as { error?: string }).error ??
        "Không tải được danh sách người dùng. Kiểm tra lại phiên quản trị.",
    );
  }

  return (data as { users?: UserPreviewRow[] }).users ?? [];
}

export function AdminUsersLivePanel({ initialUsers }: { initialUsers: UserPreviewRow[] }) {
  const [users, setUsers] = useState<UserPreviewRow[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() => new Date().toISOString());
  const [streamState, setStreamState] = useState<"connecting" | "live" | "reconnecting">(
    "connecting",
  );

  const refreshUsers = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const nextUsers = await fetchUsersPreview();
      setUsers(nextUsers);
      setLastSyncedAt(new Date().toISOString());
      if (!silent) {
        setError(null);
      }
    } catch (nextError) {
      if (!silent) {
        setError((nextError as Error).message);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const eventSource = new EventSource("/api/admin/users/stream");

    const handleUsers = (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as StreamPayload;
      setUsers(payload.users ?? []);
      setLastSyncedAt(payload.streamed_at ?? new Date().toISOString());
      setStreamState("live");
      setError(null);
    };

    const handleProblem = (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as StreamPayload;
      setError(payload.error ?? "Luồng realtime đang gặp lỗi.");
    };

    const handleError = () => {
      setStreamState("reconnecting");
    };

    eventSource.addEventListener("open", () => {
      setStreamState("live");
      setError(null);
    });
    eventSource.addEventListener("users", handleUsers as EventListener);
    eventSource.addEventListener("problem", handleProblem as EventListener);
    eventSource.addEventListener("error", handleError);
    eventSource.onerror = () => {
      setStreamState("reconnecting");
    };

    return () => {
      eventSource.removeEventListener("users", handleUsers as EventListener);
      eventSource.removeEventListener("problem", handleProblem as EventListener);
      eventSource.removeEventListener("error", handleError);
      eventSource.close();
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: users.length,
      admin: users.filter((row) => (row.role ?? "viewer") === "admin").length,
      blocked: users.filter((row) =>
        ["blocked", "disabled"].includes((row.status ?? "").toLowerCase()),
      ).length,
    }),
    [users],
  );

  const handleImport = (file?: File | null) => {
    if (!file) return;
    setImporting(true);
    setError(null);
    setNotice(null);

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const response = await fetch("/api/admin/users/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: result.data }),
          });
          const data = (await response.json().catch(() => ({}))) as ImportResult & {
            error?: string;
          };

          if (!response.ok) {
            throw new Error(data.error ?? "Import user that bai.");
          }

          const failed = Number(data.failed ?? 0);
          const imported = Number(data.imported ?? 0);
          if (failed > 0) {
            const preview = data.errors
              ?.slice(0, 2)
              .map((item) => `dong ${item.index}: ${item.error}`);
            setNotice(
              `Da import ${imported} user, loi ${failed}${
                preview?.length ? ` (${preview.join("; ")})` : ""
              }.`,
            );
          } else {
            setNotice(`Da import ${imported} user vao Postgres.`);
          }
          await refreshUsers(true);
        } catch (nextError) {
          setError((nextError as Error).message);
        } finally {
          setImporting(false);
        }
      },
      error: (nextError) => {
        setImporting(false);
        setError(nextError.message);
      },
    });
  };

  return (
    <section className={shellStyles.panel}>
      <div className={shellStyles.panelHead}>
        <div>
          <span className={shellStyles.panelEyebrow}>Users realtime</span>
          <h2>Danh sach user truc tiep tu Postgres</h2>
        </div>
        <div className={shellStyles.inlineActions}>
          <label className="btn btn-admin-outline">
            {importing ? "Dang import..." : "Import user"}
            <input
              className="admin-file"
              type="file"
              accept=".csv"
              disabled={importing}
              onChange={(event) => {
                handleImport(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <button
            className="btn btn-admin-outline"
            type="button"
            disabled={loading}
            onClick={() => void refreshUsers(false)}
          >
            {loading ? "Dang tai..." : "Lam moi"}
          </button>
          <Link className="studio-link-inline" href="/admin?tab=users">
            Mo quan ly user
          </Link>
        </div>
      </div>

      <div className={shellStyles.timelineSummary}>
        <div className={shellStyles.timelineSummaryCard}>
          <span>Ban ghi hien thi</span>
          <strong>{stats.total}</strong>
          <p>
            {streamState === "live"
              ? "Luong SSE dang day thay doi truc tiep tu Postgres."
              : "Luong realtime dang ket noi lai voi dashboard."}
          </p>
        </div>
        <div className={shellStyles.timelineSummaryCard}>
          <span>Admin trong snapshot</span>
          <strong>{stats.admin}</strong>
          <p>Doc truc tiep tu `users`, khong can mo pgAdmin de ra nhanh.</p>
        </div>
        <div className={shellStyles.timelineSummaryCard}>
          <span>Bi khoa trong snapshot</span>
          <strong>{stats.blocked}</strong>
          <p>
            {streamState === "live" ? "Realtime hoat dong" : "Dang reconnect"}. Lan nhan gan
            nhat: {formatDateTime(lastSyncedAt)}
          </p>
        </div>
      </div>

      <div className={shellStyles.panelSubcopy}>
        <p>
          Import nhan file CSV voi cac cot nhu `email`, `name`, `display_name`, `role`,
          `status`, `password`, `phone`.
        </p>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {notice ? <p className={shellStyles.noticeText}>{notice}</p> : null}

      <div className={shellStyles.dataTableWrap}>
        <table className={shellStyles.dataTable}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Ten</th>
              <th>GID</th>
              <th>Vai tro</th>
              <th>Trang thai</th>
              <th>Cap nhat</th>
            </tr>
          </thead>
          <tbody>
            {!users.length ? (
              <tr>
                <td colSpan={6} className={shellStyles.dataTableEmpty}>
                  Chua co user nao trong bang `users`.
                </td>
              </tr>
            ) : null}
            {users.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className={shellStyles.dataCellPrimary}>
                    <strong>{row.email}</strong>
                  </div>
                </td>
                <td>{row.display_name ?? row.name ?? "-"}</td>
                <td>{row.gid ?? "-"}</td>
                <td>
                  <span className={shellStyles.dataPill}>{row.role ?? "viewer"}</span>
                </td>
                <td>
                  <span className={shellStyles.dataPill}>{row.status ?? "active"}</span>
                </td>
                <td>{formatDateTime(row.updated_at ?? row.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
