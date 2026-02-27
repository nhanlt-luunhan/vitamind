"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui";

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
};

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  display_name: string | null;
  role: string | null;
  status: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  sku: string | null;
  brand: string | null;
  category: string | null;
  images: string[] | null;
  specs: Record<string, unknown> | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

type OrderRow = {
  id: string;
  user_id: string | null;
  user_email?: string | null;
  items: unknown;
  subtotal: number | string;
  shipping: number | string;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  summary: string | string[] | null;
  cover_image: string | null;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  published: boolean;
  created_at: string;
  updated_at: string | null;
  fileName: string;
};

type MediaRow = {
  id: string;
  url: string;
  type: string | null;
  meta: any;
  created_at: string;
  updated_at: string | null;
};

type AuditRow = {
  id: string;
  actor_email: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
};

const roleRank = {
  admin: 3,
  editor: 2,
  viewer: 1,
} as const;

type Role = keyof typeof roleRank;

const normalizeRole = (role?: string | null): Role => {
  if (role === "admin" || role === "editor" || role === "viewer") return role;
  return "viewer";
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
};

const toNumber = (value: string | number) => {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const fetchJson = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (data as any)?.error || "Có lỗi xảy ra.";
    throw new Error(message);
  }
  return data;
};

const exportCsv = (name: string, rows: Array<Record<string, unknown>>) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escapeCsv = (value: unknown) => {
    const text = String(value ?? "");
    if (/[\",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };
  const content = [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => escapeCsv(row[key])).join(",")),
  ].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export function AdminPanel({ user }: { user: SessionUser }) {
  const role = normalizeRole(user.role);
  const canAdmin = roleRank[role] >= roleRank.admin;
  const canEdit = roleRank[role] >= roleRank.editor;
  const canView = roleRank[role] >= roleRank.viewer;

  const [activeTab, setActiveTab] = useState<
    "users" | "products" | "orders" | "blog" | "media" | "audit"
  >("users");

  const tabs = [
    { key: "users", label: "Người dùng", visible: canAdmin },
    { key: "products", label: "Sản phẩm", visible: canView },
    { key: "orders", label: "Đơn hàng", visible: canView },
    { key: "blog", label: "Blog", visible: canView },
    { key: "media", label: "Media", visible: canView },
    { key: "audit", label: "Audit", visible: canAdmin },
  ].filter((tab) => tab.visible);

  useEffect(() => {
    if (tabs.length && !tabs.find((tab) => tab.key === activeTab)) {
      setActiveTab(tabs[0].key as typeof activeTab);
    }
  }, [tabs, activeTab]);

  return (
    <div className="admin-shell mt-40">
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "users" && canAdmin ? <UsersTab canManage={canAdmin} /> : null}
      {activeTab === "products" ? <ProductsTab canEdit={canEdit} /> : null}
      {activeTab === "orders" ? <OrdersTab canEdit={canAdmin} /> : null}
      {activeTab === "blog" ? <BlogTab canEdit={canEdit} /> : null}
      {activeTab === "media" ? <MediaTab canEdit={canEdit} /> : null}
      {activeTab === "audit" && canAdmin ? <AuditTab /> : null}

      {!canView ? (
        <div className="admin-panel mt-30">
          <p className="color-gray-500">Bạn không có quyền truy cập.</p>
        </div>
      ) : null}
    </div>
  );
}

function UsersTab({ canManage }: { canManage: boolean }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<UserRow | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson("/api/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const term = search.toLowerCase();
    return users.filter((user) =>
      [user.email, user.name, user.display_name, user.role, user.status].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [users, search]);

  const handleSave = async () => {
    if (!editing) return;
    setError(null);
    try {
      const payload = {
        role: editing.role,
        status: editing.status,
      };
      const data = await fetchJson(`/api/admin/users/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setUsers((prev) => prev.map((item) => (item.id === editing.id ? data.user : item)));
      setEditing(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleBlock = async (id: string) => {
    if (!confirm("Khoá user này?")) return;
    setError(null);
    try {
      await fetchJson(`/api/admin/users/${id}`, { method: "DELETE" });
      setUsers((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "blocked" } : item)),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!canManage) {
    return (
      <div className="admin-panel mt-30">
        <p className="color-gray-500">Bạn không có quyền quản lý người dùng.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel mt-30">
      <div className="admin-toolbar">
        <div>
          <h4 className="color-white mb-5">Người dùng</h4>
          <p className="text-sm color-gray-500">Phân quyền và quản lý trạng thái tài khoản.</p>
        </div>
        <div className="admin-toolbar__actions">
          <input
            className="admin-input"
            placeholder="Tìm theo email, tên, role"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button unstyled className="btn btn-admin-outline" type="button" onClick={loadUsers}>
            Làm mới
          </Button>
        </div>
      </div>

      {error ? <p className="admin-error mt-15">{error}</p> : null}

      <div className="admin-table-wrapper mt-20">
        <table className="table admin-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Email</th>
              <th>Tên</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th>Tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Đang tải...</td>
              </tr>
            ) : null}
            {!loading && !filtered.length ? (
              <tr>
                <td colSpan={7}>Chưa có dữ liệu.</td>
              </tr>
            ) : null}
            {filtered.map((row) => {
              const isEditing = editing?.id === row.id;
                  const displayName = row.display_name ?? row.name ?? "-";
                  const statusLabel = row.status === "disabled" ? "blocked" : row.status ?? "active";
              return (
                <tr key={row.id}>
                  <td>
                    {row.avatar_url ? (
                      <img className="admin-media-thumb" src={row.avatar_url} alt="avatar" />
                    ) : (
                      <span className="admin-badge">User</span>
                    )}
                  </td>
                  <td>{row.email}</td>
                  <td>{displayName}</td>
                  <td>
                    {isEditing ? (
                      <select
                        className="admin-select"
                        value={editing?.role ?? "viewer"}
                        onChange={(event) =>
                          setEditing((prev) =>
                            prev ? { ...prev, role: event.target.value } : prev,
                          )
                        }
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="admin-badge">{row.role ?? "viewer"}</span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        className="admin-select"
                        value={
                          editing?.status === "disabled"
                            ? "blocked"
                            : editing?.status ?? "active"
                        }
                        onChange={(event) =>
                          setEditing((prev) =>
                            prev ? { ...prev, status: event.target.value } : prev,
                          )
                        }
                      >
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    ) : (
                      statusLabel
                    )}
                  </td>
                  <td>{formatDate(row.created_at)}</td>
                  <td className="admin-actions">
                    {isEditing ? (
                      <>
                        <button className="btn btn-linear" onClick={handleSave} type="button">
                          Lưu
                        </button>
                        <button
                          className="btn btn-admin-outline"
                          onClick={() => setEditing(null)}
                          type="button"
                        >
                          Huỷ
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-admin-outline"
                          onClick={() => setEditing(row)}
                          type="button"
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-admin-outline"
                          onClick={() => handleBlock(row.id)}
                          type="button"
                        >
                          Khoá
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function ProductsTab({ canEdit }: { canEdit: boolean }) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [form, setForm] = useState({ name: "", price: "", sku: "", category: "", status: "draft" });

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson("/api/admin/products");
      setProducts(data.products || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const term = search.toLowerCase();
    return products.filter((row) =>
      [row.name, row.slug, row.sku, row.category, row.status]
        .map((value) => String(value ?? "").toLowerCase())
        .some((value) => value.includes(term)),
    );
  }, [products, search]);

  const handleCreate = async () => {
    if (!canEdit) return;
    setError(null);
    try {
      const payload = {
        name: form.name,
        price: form.price,
        sku: form.sku,
        category: form.category,
        status: form.status,
      };
      const data = await fetchJson("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setProducts((prev) => [data.product, ...prev]);
      setForm({ name: "", price: "", sku: "", category: "", status: "draft" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setError(null);
    try {
      const payload = {
        name: editing.name,
        price: editing.price,
        sku: editing.sku,
        category: editing.category,
        status: editing.status,
      };
      const data = await fetchJson(`/api/admin/products/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setProducts((prev) => prev.map((item) => (item.id === editing.id ? data.product : item)));
      setEditing(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if (!confirm("Xóa sản phẩm này?")) return;
    setError(null);
    try {
      await fetchJson(`/api/admin/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleImport = (file?: File | null) => {
    if (!file) return;
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          await fetchJson("/api/admin/products/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: result.data }),
          });
          loadProducts();
        } catch (err) {
          setError((err as Error).message);
        }
      },
    });
  };

  const handleExport = () => {
    const rows = products.map((row) => ({
      name: row.name,
      slug: row.slug,
      price: row.price,
      sku: row.sku ?? "",
      brand: row.brand ?? "",
      category: row.category ?? "",
      status: row.status ?? "",
      images: (row.images ?? []).join(","),
      specs: row.specs ? JSON.stringify(row.specs) : "",
    }));
    exportCsv("products", rows);
  };

  return (
    <div className="admin-panel mt-30">
      <div className="admin-toolbar">
        <div>
          <h4 className="color-white mb-5">Sản phẩm</h4>
          <p className="text-sm color-gray-500">
            Quản lý danh mục sản phẩm, giá và trạng thái hiển thị.
          </p>
        </div>
        <div className="admin-toolbar__actions">
          <input
            className="admin-input"
            placeholder="Tìm theo tên, SKU, category"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <label className="btn btn-admin-outline">
            Import CSV
            <input
              className="admin-file"
              type="file"
              accept=".csv"
              onChange={(event) => handleImport(event.target.files?.[0])}
            />
          </label>
          <button className="btn btn-admin-outline" onClick={handleExport} type="button">
            Export CSV
          </button>
          <button className="btn btn-admin-outline" onClick={loadProducts} type="button">
            Làm mới
          </button>
        </div>
      </div>

      {canEdit ? (
        <div className="admin-form-grid mt-20">
          <input
            className="admin-input"
            placeholder="Tên sản phẩm"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="admin-input"
            placeholder="Giá"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
          />
          <input
            className="admin-input"
            placeholder="SKU"
            value={form.sku}
            onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
          />
          <input
            className="admin-input"
            placeholder="Danh mục"
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
          />
          <select
            className="admin-select"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <Button unstyled className="btn btn-linear" type="button" onClick={handleCreate}>
            Thêm sản phẩm
          </Button>
        </div>
      ) : null}

      {error ? <p className="admin-error mt-15">{error}</p> : null}

      <div className="admin-table-wrapper mt-20">
        <table className="table admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giá</th>
              <th>SKU</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Đang tải...</td>
              </tr>
            ) : null}
            {!loading && !filtered.length ? (
              <tr>
                <td colSpan={7}>Chưa có dữ liệu.</td>
              </tr>
            ) : null}
            {filtered.map((row) => {
              const isEditing = editing?.id === row.id;
              return (
                <tr key={row.id}>
                  <td>
                    {isEditing ? (
                      <input
                        className="admin-input"
                        value={editing?.name ?? ""}
                        onChange={(event) =>
                          setEditing((prev) =>
                            prev ? { ...prev, name: event.target.value } : prev,
                          )
                        }
                      />
                    ) : (
                      row.name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        className="admin-input"
                        value={editing?.price ?? ""}
                        onChange={(event) =>
                          setEditing((prev) =>
                            prev ? { ...prev, price: event.target.value } : prev,
                          )
                        }
                      />
                    ) : (
                      toNumber(row.price).toLocaleString("vi-VN")
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        className="admin-input"
                        value={editing?.sku ?? ""}
                        onChange={(event) =>
                          setEditing((prev) => (prev ? { ...prev, sku: event.target.value } : prev))
                        }
                      />
                    ) : (
                      (row.sku ?? "-")
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        className="admin-input"
                        value={editing?.category ?? ""}
                        onChange={(event) =>
                          setEditing((prev) =>
                            prev ? { ...prev, category: event.target.value } : prev,
                          )
                        }
                      />
                    ) : (
                      (row.category ?? "-")
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        className="admin-select"
                        value={editing?.status ?? "draft"}
                        onChange={(event) =>
                          setEditing((prev) =>
                            prev ? { ...prev, status: event.target.value } : prev,
                          )
                        }
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    ) : (
                      (row.status ?? "draft")
                    )}
                  </td>
                  <td>{formatDate(row.updated_at ?? row.created_at)}</td>
                  <td className="admin-actions">
                    {canEdit ? (
                      isEditing ? (
                        <>
                          <button className="btn btn-linear" onClick={handleSave} type="button">
                            Lưu
                          </button>
                          <button
                            className="btn btn-admin-outline"
                            onClick={() => setEditing(null)}
                            type="button"
                          >
                            Huỷ
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-admin-outline"
                            onClick={() => setEditing(row)}
                            type="button"
                          >
                            Sửa
                          </button>
                          <button
                            className="btn btn-admin-outline"
                            onClick={() => handleDelete(row.id)}
                            type="button"
                          >
                            Xoá
                          </button>
                        </>
                      )
                    ) : (
                      <span className="text-sm color-gray-500">Read-only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab({ canEdit }: { canEdit: boolean }) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<OrderRow | null>(null);
  const [form, setForm] = useState({
    user_id: "",
    items: "[]",
    subtotal: "",
    shipping: "",
    status: "new",
  });

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson("/api/admin/orders");
      setOrders(data.orders || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const term = search.toLowerCase();
    return orders.filter((row) =>
      [row.id, row.user_email, row.status]
        .map((value) => String(value ?? "").toLowerCase())
        .some((value) => value.includes(term)),
    );
  }, [orders, search]);

  const handleCreate = async () => {
    if (!canEdit) return;
    setError(null);
    try {
      const payload = {
        user_id: form.user_id || null,
        items: form.items,
        subtotal: form.subtotal,
        shipping: form.shipping,
        status: form.status,
      };
      const data = await fetchJson("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setOrders((prev) => [data.order, ...prev]);
      setForm({ user_id: "", items: "[]", subtotal: "", shipping: "", status: "new" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setError(null);
    try {
      const payload = {
        status: editing.status,
        items: editing.items,
        subtotal: editing.subtotal,
        shipping: editing.shipping,
      };
      const data = await fetchJson(`/api/admin/orders/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setOrders((prev) => prev.map((item) => (item.id === editing.id ? data.order : item)));
      setEditing(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="admin-panel mt-30">
      <div className="admin-toolbar">
        <div>
          <h4 className="color-white mb-5">Đơn hàng</h4>
          <p className="text-sm color-gray-500">Theo dõi và cập nhật trạng thái đơn hàng.</p>
        </div>
        <div className="admin-toolbar__actions">
          <input
            className="admin-input"
            placeholder="Tìm theo mã, email, trạng thái"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="btn btn-admin-outline" onClick={loadOrders} type="button">
            Làm mới
          </button>
        </div>
      </div>

      {canEdit ? (
        <div className="admin-form-grid mt-20">
          <input
            className="admin-input"
            placeholder="User ID (optional)"
            value={form.user_id}
            onChange={(event) => setForm((prev) => ({ ...prev, user_id: event.target.value }))}
          />
          <input
            className="admin-input"
            placeholder="Items JSON"
            value={form.items}
            onChange={(event) => setForm((prev) => ({ ...prev, items: event.target.value }))}
          />
          <input
            className="admin-input"
            placeholder="Subtotal"
            value={form.subtotal}
            onChange={(event) => setForm((prev) => ({ ...prev, subtotal: event.target.value }))}
          />
          <input
            className="admin-input"
            placeholder="Shipping"
            value={form.shipping}
            onChange={(event) => setForm((prev) => ({ ...prev, shipping: event.target.value }))}
          />
          <select
            className="admin-select"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="new">New</option>
            <option value="paid">Paid</option>
            <option value="shipping">Shipping</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button unstyled className="btn btn-linear" type="button" onClick={handleCreate}>
            Tạo đơn
          </Button>
        </div>
      ) : null}

      {error ? <p className="admin-error mt-15">{error}</p> : null}

      <div className="admin-table-wrapper mt-20">
        <table className="table admin-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>User</th>
              <th>Tạm tính</th>
              <th>Shipping</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Đang tải...</td>
              </tr>
            ) : null}
            {!loading && !filtered.length ? (
              <tr>
                <td colSpan={7}>Chưa có dữ liệu.</td>
              </tr>
            ) : null}
            {filtered.map((row) => {
              const isEditing = editing?.id === row.id;
              return (
                <tr key={row.id}>
                  <td>{row.id.slice(0, 8)}</td>
                  <td>{row.user_email ?? row.user_id ?? "-"}</td>
                  <td>{toNumber(row.subtotal).toLocaleString("vi-VN")}</td>
                  <td>{toNumber(row.shipping).toLocaleString("vi-VN")}</td>
                  <td>
                    {isEditing ? (
                      <select
                        className="admin-select"
                        value={editing?.status ?? "new"}
                        onChange={(event) =>
                          setEditing((prev) =>
                            prev ? { ...prev, status: event.target.value } : prev,
                          )
                        }
                      >
                        <option value="new">New</option>
                        <option value="paid">Paid</option>
                        <option value="shipping">Shipping</option>
                        <option value="done">Done</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      (row.status ?? "new")
                    )}
                  </td>
                  <td>{formatDate(row.created_at)}</td>
                  <td className="admin-actions">
                    {canEdit ? (
                      isEditing ? (
                        <>
                          <button className="btn btn-linear" onClick={handleSave} type="button">
                            Lưu
                          </button>
                          <button
                            className="btn btn-admin-outline"
                            onClick={() => setEditing(null)}
                            type="button"
                          >
                            Huỷ
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-admin-outline"
                          onClick={() => setEditing(row)}
                          type="button"
                        >
                          Cập nhật
                        </button>
                      )
                    ) : (
                      <span className="text-sm color-gray-500">Read-only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function BlogTab({ canEdit }: { canEdit: boolean }) {
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<BlogRow | null>(null);
  const [form, setForm] = useState({ title: "", category: "", description: "" });

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson("/api/admin/blog");
      setPosts(data.posts || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const term = search.toLowerCase();
    return posts.filter((row) =>
      [row.title, row.slug, row.category, row.tags?.join(",")]
        .map((value) => String(value ?? "").toLowerCase())
        .some((value) => value.includes(term)),
    );
  }, [posts, search]);

  const handleCreate = async () => {
    if (!canEdit) return;
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
      };
      const data = await fetchJson("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setPosts((prev) => [data.post, ...prev]);
      setForm({ title: "", category: "", description: "" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setError(null);
    try {
      const payload = {
        title: editing.title,
        description: editing.description,
        category: editing.category,
        tags: editing.tags,
        published: editing.published,
      };
      const data = await fetchJson(`/api/admin/blog/${editing.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setPosts((prev) => prev.map((item) => (item.slug === editing.slug ? data.post : item)));
      setEditing(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleArchive = async (slug: string) => {
    if (!canEdit) return;
    if (!confirm("Ẩn bài viết này?")) return;
    setError(null);
    try {
      await fetchJson(`/api/admin/blog/${slug}`, { method: "DELETE" });
      setPosts((prev) =>
        prev.map((item) => (item.slug === slug ? { ...item, published: false } : item)),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="admin-panel mt-30">
      <div className="admin-toolbar">
        <div>
          <h4 className="color-white mb-5">Blog</h4>
          <p className="text-sm color-gray-500">Quản lý metadata cho bài viết dạng file.</p>
        </div>
        <div className="admin-toolbar__actions">
          <input
            className="admin-input"
            placeholder="Tìm theo tiêu đề, slug, tag"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="btn btn-admin-outline" onClick={loadPosts} type="button">
            Làm mới
          </button>
        </div>
      </div>

      {canEdit ? (
        <div className="admin-form-grid mt-20">
          <input
            className="admin-input"
            placeholder="Tiêu đề"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <input
            className="admin-input"
            placeholder="Danh mục"
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
          />
          <input
            className="admin-input"
            placeholder="Mô tả ngắn"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <Button unstyled className="btn btn-linear" type="button" onClick={handleCreate}>
            Tạo bài viết
          </Button>
        </div>
      ) : null}

      {error ? <p className="admin-error mt-15">{error}</p> : null}

      <div className="admin-table-wrapper mt-20">
        <table className="table admin-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Slug</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Đang tải...</td>
              </tr>
            ) : null}
            {!loading && !filtered.length ? (
              <tr>
                <td colSpan={6}>Chưa có dữ liệu.</td>
              </tr>
            ) : null}
            {filtered.map((row) => {
              const isEditing = editing?.slug === row.slug;
              return (
                <tr key={row.slug}>
                  <td>
                    {isEditing ? (
                      <input
                        className="admin-input"
                        value={editing?.title ?? ""}
                        onChange={(event) =>
                          setEditing((prev) =>
                            prev ? { ...prev, title: event.target.value } : prev,
                          )
                        }
                      />
                    ) : (
                      row.title
                    )}
                  </td>
                  <td>{row.slug}</td>
                  <td>
                    {isEditing ? (
                      <input
                        className="admin-input"
                        value={editing?.category ?? ""}
                        onChange={(event) =>
                          setEditing((prev) =>
                            prev ? { ...prev, category: event.target.value } : prev,
                          )
                        }
                      />
                    ) : (
                      (row.category ?? "-")
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        className="admin-select"
                        value={editing?.published ? "published" : "draft"}
                        onChange={(event) =>
                          setEditing((prev) =>
                            prev
                              ? { ...prev, published: event.target.value === "published" }
                              : prev,
                          )
                        }
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    ) : row.published ? (
                      "Published"
                    ) : (
                      "Draft"
                    )}
                  </td>
                  <td>{formatDate(row.updated_at ?? row.created_at)}</td>
                  <td className="admin-actions">
                    {canEdit ? (
                      isEditing ? (
                        <>
                          <button className="btn btn-linear" onClick={handleSave} type="button">
                            Lưu
                          </button>
                          <button
                            className="btn btn-admin-outline"
                            onClick={() => setEditing(null)}
                            type="button"
                          >
                            Huỷ
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-admin-outline"
                            onClick={() => setEditing(row)}
                            type="button"
                          >
                            Sửa
                          </button>
                          <button
                            className="btn btn-admin-outline"
                            onClick={() => handleArchive(row.slug)}
                            type="button"
                          >
                            Ẩn
                          </button>
                        </>
                      )
                    ) : (
                      <span className="text-sm color-gray-500">Read-only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MediaTab({ canEdit }: { canEdit: boolean }) {
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson("/api/admin/media");
      setMedia(data.media || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (file?: File | null) => {
    if (!file || !canEdit) return;
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await fetchJson("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      setMedia((prev) => [data.media, ...prev]);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if (!confirm("Xoá media này?")) return;
    setError(null);
    try {
      await fetchJson(`/api/admin/media/${id}`, { method: "DELETE" });
      setMedia((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="admin-panel mt-30">
      <div className="admin-toolbar">
        <div>
          <h4 className="color-white mb-5">Media</h4>
          <p className="text-sm color-gray-500">Upload và quản lý tài nguyên hình ảnh / file.</p>
        </div>
        <div className="admin-toolbar__actions">
          {canEdit ? (
            <label className="btn btn-admin-outline">
              Upload
              <input
                className="admin-file"
                type="file"
                onChange={(event) => handleUpload(event.target.files?.[0])}
              />
            </label>
          ) : null}
          <button className="btn btn-admin-outline" onClick={loadMedia} type="button">
            Làm mới
          </button>
        </div>
      </div>

      {error ? <p className="admin-error mt-15">{error}</p> : null}

      <div className="admin-table-wrapper mt-20">
        <table className="table admin-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>URL</th>
              <th>Type</th>
              <th>Ngày</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Đang tải...</td>
              </tr>
            ) : null}
            {!loading && !media.length ? (
              <tr>
                <td colSpan={5}>Chưa có dữ liệu.</td>
              </tr>
            ) : null}
            {media.map((row) => {
              const isImage = row.type?.startsWith("image/");
              return (
                <tr key={row.id}>
                  <td>
                    {isImage ? (
                      <img className="admin-media-thumb" src={row.url} alt="media" />
                    ) : (
                      <span className="admin-badge">FILE</span>
                    )}
                  </td>
                  <td className="admin-truncate">{row.url}</td>
                  <td>{row.type ?? "-"}</td>
                  <td>{formatDate(row.created_at)}</td>
                  <td className="admin-actions">
                    {canEdit ? (
                      <button
                        className="btn btn-admin-outline"
                        onClick={() => handleDelete(row.id)}
                        type="button"
                      >
                        Xoá
                      </button>
                    ) : (
                      <span className="text-sm color-gray-500">Read-only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditTab() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson("/api/admin/audit");
      setRows(data.audit || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  return (
    <div className="admin-panel mt-30">
      <div className="admin-toolbar">
        <div>
          <h4 className="color-white mb-5">Audit log</h4>
          <p className="text-sm color-gray-500">Theo dõi các thay đổi quan trọng trong admin.</p>
        </div>
        <div className="admin-toolbar__actions">
          <button className="btn btn-admin-outline" onClick={loadAudit} type="button">
            Làm mới
          </button>
        </div>
      </div>

      {error ? <p className="admin-error mt-15">{error}</p> : null}

      <div className="admin-table-wrapper mt-20">
        <table className="table admin-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người thao tác</th>
              <th>Hành động</th>
              <th>Bảng</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Đang tải...</td>
              </tr>
            ) : null}
            {!loading && !rows.length ? (
              <tr>
                <td colSpan={5}>Chưa có dữ liệu.</td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDate(row.created_at)}</td>
                <td>{row.actor_email ?? "-"}</td>
                <td>{row.action}</td>
                <td>{row.table_name}</td>
                <td>{row.record_id ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
