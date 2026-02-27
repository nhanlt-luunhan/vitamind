"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  created_at: string | Date;
  updated_at: string | Date | null;
};

const formatDate = (value: string | Date | null) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
};

type Props = {
  initialUsers: UserRow[];
};

export function UsersManager({ initialUsers }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      email: String(formData.get("email") ?? ""),
      name: String(formData.get("name") ?? ""),
      role: String(formData.get("role") ?? "admin"),
      password: String(formData.get("password") ?? ""),
    };

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Không thể tạo user.");
      setBusy(false);
      return;
    }

    const data = await response.json();
    form.reset();
    setUsers((prev) => {
      const next = prev.filter((item) => item.id !== data.user.id);
      return [data.user, ...next];
    });
    setBusy(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá user này?")) return;
    setError("");
    setBusy(true);
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Không thể xoá user.");
      setBusy(false);
      return;
    }

    setUsers((prev) => prev.filter((user) => user.id !== id));
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="admin-panel mt-40">
      <div className="d-flex align-items-center justify-content-between mb-20">
        <div>
          <h4 className="color-white mb-5">Quản lý Users</h4>
          <p className="color-gray-500 text-sm">Thêm hoặc xoá tài khoản quản trị.</p>
        </div>
        <Button
          unstyled
          className="btn btn-linear btn-sm"
          type="button"
          onClick={() => router.refresh()}
        >
          Làm mới
        </Button>
      </div>

      <form className="row g-3" onSubmit={handleCreate}>
        <div className="col-md-4">
          <input
            className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
            name="email"
            type="email"
            placeholder="Email"
            required
          />
        </div>
        <div className="col-md-3">
          <input
            className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
            name="name"
            type="text"
            placeholder="Tên"
          />
        </div>
        <div className="col-md-2">
          <input
            className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
            name="role"
            type="text"
            placeholder="Role"
            defaultValue="admin"
          />
        </div>
        <div className="col-md-2">
          <input
            className="form-control bg-gray-900 border-gray-800 bdrd16 color-gray-500"
            name="password"
            type="password"
            placeholder="Mật khẩu"
            required
          />
        </div>
        <div className="col-md-1 d-grid">
          <Button unstyled className="btn btn-linear w-100" type="submit" disabled={busy}>
            Thêm
          </Button>
        </div>
      </form>

      {error ? <p className="admin-error mt-10">{error}</p> : null}

      <div className="table-responsive mt-30">
        <table className="table table-dark table-striped admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Tên</th>
              <th>Vai trò</th>
              <th>Tạo ngày</th>
              <th>Cập nhật</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="color-gray-500">
                  Chưa có dữ liệu.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.name ?? "-"}</td>
                  <td>
                    <span className="admin-badge">{user.role ?? "user"}</span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>{formatDate(user.updated_at)}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-admin-outline"
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      disabled={busy}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
