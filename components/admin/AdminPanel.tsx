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
  gid: string | null;
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

type UploadScope = "posts" | "products";

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

const formatRoleLabel = (role?: string | null) => {
  if (role === "admin") return "Admin";
  if (role === "editor") return "Biên tập";
  return "Xem";
};

const formatStatusLabel = (status?: string | null) => {
  if (status === "disabled" || status === "blocked") return "Bị khóa";
  if (status === "active" || !status) return "Hoạt động";
  if (status === "published") return "Đã xuất bản";
  if (status === "archived") return "Lưu trữ";
  if (status === "draft") return "Bản nháp";
  if (status === "paid") return "Đã thanh toán";
  if (status === "shipping") return "Đang giao";
  if (status === "done") return "Hoàn tất";
  if (status === "cancelled") return "Đã hủy";
  if (status === "new") return "Mới";
  return status;
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

const uploadAdminAsset = async (scope: UploadScope, file?: File | null) => {
  if (!file) {
    throw new Error("Chưa chọn tệp.");
  }

  const formData = new FormData();
  formData.append("file", file);
  const data = await fetchJson(`/api/admin/uploads/${scope}`, {
    method: "POST",
    body: formData,
  });
  return String((data as { url?: string }).url ?? "").trim();
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

type AdminWorkspaceMetric = {
  label: string;
  value: string;
  note: string;
};

function AdminWorkspaceBanner({
  eyebrow,
  title,
  description,
  metrics,
}: {
  eyebrow: string;
  title: string;
  description: string;
  metrics: AdminWorkspaceMetric[];
}) {
  return (
    <div className="admin-workspace-banner">
      <div className="admin-workspace-banner__copy">
        <span className="admin-workspace-banner__eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="admin-workspace-banner__metrics">
        {metrics.map((metric) => (
          <div key={metric.label} className="admin-workspace-metric">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export type AdminTabKey = "users" | "products" | "orders" | "blog" | "media" | "audit";

export function AdminPanel({
  user,
  initialTab,
  showSidebar = true,
}: {
  user: SessionUser;
  initialTab?: AdminTabKey;
  showSidebar?: boolean;
}) {
  const role = normalizeRole(user.role);
  const canAdmin = roleRank[role] >= roleRank.admin;
  const canEdit = roleRank[role] >= roleRank.editor;
  const canView = roleRank[role] >= roleRank.viewer;

  const [activeTab, setActiveTab] = useState<AdminTabKey>(initialTab ?? "users");

  const tabs = [
    {
      key: "users",
      label: "Người dùng",
      visible: canAdmin,
      description: "Phân quyền, trạng thái và vai trò truy cập.",
    },
    {
      key: "products",
      label: "Sản phẩm",
      visible: canView,
      description: "Danh mục thương mại, giá và khả năng xuất nhập dữ liệu.",
    },
    {
      key: "orders",
      label: "Đơn hàng",
      visible: canView,
      description: "Vận hành và cập nhật trạng thái cho giao dịch.",
    },
    {
      key: "blog",
      label: "Blog",
      visible: canView,
      description: "Nội dung, metadata và trạng thái phát hành bài viết.",
    },
    {
      key: "media",
      label: "Thư viện",
      visible: canView,
      description: "Tài nguyên hình ảnh và tệp tải lên.",
    },
    {
      key: "audit",
      label: "Nhật ký",
      visible: canAdmin,
      description: "Lịch sử thao tác và truy vết thay đổi quan trọng.",
    },
  ].filter((tab) => tab.visible);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [activeTab, initialTab]);

  const activeWorkspace = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  useEffect(() => {
    if (tabs.length && !tabs.find((tab) => tab.key === activeTab)) {
      setActiveTab(tabs[0].key as typeof activeTab);
    }
  }, [tabs, activeTab]);

  return (
    <div className="admin-shell mt-40">
      <div className="admin-workspace-overview">
        <div className="admin-workspace-overview__copy">
          <span className="admin-workspace-overview__eyebrow">Phân khu đang hoạt động</span>
          <h3>{activeWorkspace?.label ?? "Không khả dụng"}</h3>
          <p>
            {activeWorkspace?.description ??
              "Không tìm thấy phân khu phù hợp với quyền truy cập hiện tại."}
          </p>
        </div>
        <div className="admin-workspace-overview__meta">
          <div className="admin-workspace-overview__chip">
            <span>Vai trò</span>
            <strong>{formatRoleLabel(role)}</strong>
          </div>
          <div className="admin-workspace-overview__chip">
            <span>Tab đang mở</span>
            <strong>{tabs.length}</strong>
          </div>
          <div className="admin-workspace-overview__chip">
            <span>Chế độ</span>
            <strong>{canAdmin ? "Quản trị" : canEdit ? "Biên tập" : "Quan sát"}</strong>
          </div>
        </div>
      </div>

      <div className={`admin-stage ${showSidebar ? "" : "admin-stage--single"}`}>
        {showSidebar ? (
          <aside className="admin-stage__sidebar">
            <div className="admin-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                >
                  <strong>{tab.label}</strong>
                  <span>{tab.description}</span>
                </button>
              ))}
            </div>
          </aside>
        ) : null}

        <div className="admin-stage__content">
          {activeTab === "users" && canAdmin ? <UsersTab canManage={canAdmin} /> : null}
          {activeTab === "products" ? <ProductsTab canEdit={canEdit} /> : null}
          {activeTab === "orders" ? <OrdersTab canEdit={canAdmin} /> : null}
          {activeTab === "blog" ? <BlogTab canEdit={canEdit} /> : null}
          {activeTab === "media" ? <MediaTab canEdit={canEdit} /> : null}
          {activeTab === "audit" && canAdmin ? <AuditTab /> : null}
        </div>
      </div>

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
      [user.email, user.name, user.display_name, user.gid, user.role, user.status].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [users, search]);

  const metrics = useMemo(
    () => [
      {
        label: "Tổng người dùng",
        value: String(users.length),
        note: "Tất cả tài khoản trong hệ thống.",
      },
      {
        label: "Đang hiển thị",
        value: String(filtered.length),
        note: search.trim() ? "Đã lọc theo tìm kiếm hiện tại." : "Danh sách hiện tại.",
      },
      {
        label: "Bị khóa",
        value: String(
          users.filter((user) => ["blocked", "disabled"].includes(user.status ?? "")).length,
        ),
        note: "Tài khoản cần xem lại quyền truy cập.",
      },
    ],
    [filtered.length, search, users],
  );

  const handleSave = async () => {
    if (!editing) return;
    setError(null);
    try {
      const payload = {
        role: editing.role,
        status: editing.status,
        name: editing.name,
        display_name: editing.display_name,
        gid: editing.gid,
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

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa user này? Nếu có tài khoản Clerk liên kết, hệ thống cũng sẽ xóa bên Clerk.")) {
      return;
    }
    setError(null);
    try {
      await fetchJson(`/api/admin/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((item) => item.id !== id));
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
      <AdminWorkspaceBanner
        eyebrow="Điều phối người dùng"
        title="Phân quyền là lớp nền tảng của khu quản trị."
        description="Quản lý người dùng theo vai trò, trạng thái và khả năng truy cập. Mục này ưu tiên kiểm soát quyền hạn trước khi chỉnh dữ liệu."
        metrics={metrics}
      />

      <div className="admin-toolbar">
        <div>
          <h4 className="color-white mb-5">Người dùng</h4>
          <p className="text-sm color-gray-500">Phân quyền và quản lý trạng thái tài khoản.</p>
        </div>
        <div className="admin-toolbar__actions">
          <input
            className="admin-input"
            placeholder="Tìm theo email, tên, GID, role"
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
              <th>GID</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>Đang tải...</td>
              </tr>
            ) : null}
            {!loading && !filtered.length ? (
              <tr>
                <td colSpan={8}>Chưa có dữ liệu.</td>
              </tr>
            ) : null}
            {filtered.map((row) => {
              const isEditing = editing?.id === row.id;
              const displayName = row.display_name ?? row.name ?? "-";
              const statusLabel = formatStatusLabel(row.status);
              return (
                <tr key={row.id}>
                  <td>
                    {row.avatar_url ? (
                      <img className="admin-media-thumb" src={row.avatar_url} alt="avatar" />
                    ) : (
                      <span className="admin-badge">Người dùng</span>
                    )}
                  </td>
                  <td>{row.email}</td>
                  <td>
                    {isEditing ? (
                      <div className="admin-inline">
                        <label className="admin-inline__label">Hiển thị</label>
                        <input
                          className="admin-input"
                          value={editing?.display_name ?? ""}
                          onChange={(event) =>
                            setEditing((prev) =>
                              prev ? { ...prev, display_name: event.target.value } : prev,
                            )
                          }
                          placeholder="Tên hiển thị"
                        />
                        <label className="admin-inline__label">Tên thật</label>
                        <input
                          className="admin-input"
                          value={editing?.name ?? ""}
                          onChange={(event) =>
                            setEditing((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                          }
                          placeholder="Tên thật"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="fw-600">{displayName}</div>
                        <div className="color-gray-500 text-sm">{row.name ?? "-"}</div>
                      </>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        className="admin-input"
                        value={editing?.gid ?? ""}
                        onChange={(event) =>
                          setEditing((prev) => (prev ? { ...prev, gid: event.target.value } : prev))
                        }
                        placeholder="GID"
                      />
                    ) : (
                      row.gid ?? "-"
                    )}
                  </td>
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
                        <option value="editor">Biên tập</option>
                        <option value="viewer">Xem</option>
                      </select>
                    ) : (
                      <span className="admin-badge">
                        {formatRoleLabel(row.role)}
                      </span>
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
                        <option value="active">Hoạt động</option>
                        <option value="blocked">Bị khóa</option>
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
                          onClick={() => handleDelete(row.id)}
                          type="button"
                        >
                          Xóa
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
  const [form, setForm] = useState({
    name: "",
    price: "",
    sku: "",
    category: "",
    images: "",
    status: "draft",
  });

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

  const metrics = useMemo(
    () => [
      {
        label: "Tổng sản phẩm",
        value: String(products.length),
        note: "Toàn bộ SKU hiện có trong kho dữ liệu.",
      },
      {
        label: "Đang hiển thị",
        value: String(filtered.length),
        note: search.trim() ? "Kết quả sau khi lọc." : "Toàn bộ danh sách.",
      },
      {
        label: "Đã xuất bản",
        value: String(products.filter((row) => row.status === "published").length),
        note: "Sản phẩm đang sẵn sàng hiển thị.",
      },
    ],
    [filtered.length, products, search],
  );

  const handleCreate = async () => {
    if (!canEdit) return;
    setError(null);
    try {
      const payload = {
        name: form.name,
        price: form.price,
        sku: form.sku,
        category: form.category,
        images: form.images,
        status: form.status,
      };
      const data = await fetchJson("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setProducts((prev) => [data.product, ...prev]);
      setForm({ name: "", price: "", sku: "", category: "", images: "", status: "draft" });
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
        images: editing.images,
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

  const handleCreateImageUpload = async (file?: File | null) => {
    if (!file || !canEdit) return;
    setError(null);
    try {
      const url = await uploadAdminAsset("products", file);
      setForm((prev) => ({
        ...prev,
        images: prev.images ? `${prev.images}, ${url}` : url,
      }));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEditImageUpload = async (file?: File | null) => {
    if (!file || !editing) return;
    setError(null);
    try {
      const url = await uploadAdminAsset("products", file);
      setEditing((prev) =>
        prev
          ? {
              ...prev,
              images: [...(prev.images ?? []), url],
            }
          : prev,
      );
    } catch (err) {
      setError((err as Error).message);
    }
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
      <AdminWorkspaceBanner
        eyebrow="Trung tâm danh mục"
        title="Sản phẩm cần được điều phối như một kho hiển thị trực tiếp."
        description="Khu này gom tạo mới, nhập CSV và cập nhật giá trị trình bày. Bố cục ưu tiên thao tác nhanh và khả năng rà soát."
        metrics={metrics}
      />

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
            placeholder="Tìm theo tên, SKU, danh mục"
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
          <input
            className="admin-input"
            placeholder="URL ảnh sản phẩm, ngăn cách bằng dấu phẩy"
            value={form.images}
            onChange={(event) => setForm((prev) => ({ ...prev, images: event.target.value }))}
          />
          <select
            className="admin-select"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="draft">Bản nháp</option>
            <option value="published">Đã xuất bản</option>
            <option value="archived">Lưu trữ</option>
          </select>
          <label className="btn btn-admin-outline">
            Upload ảnh SP
            <input
              className="admin-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => handleCreateImageUpload(event.target.files?.[0])}
            />
          </label>
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
              <th>Ảnh</th>
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
                <td colSpan={8}>Đang tải...</td>
              </tr>
            ) : null}
            {!loading && !filtered.length ? (
              <tr>
                <td colSpan={8}>Chưa có dữ liệu.</td>
              </tr>
            ) : null}
            {filtered.map((row) => {
              const isEditing = editing?.id === row.id;
              const primaryImage = (isEditing ? editing?.images : row.images)?.[0] ?? null;
              return (
                <tr key={row.id}>
                  <td>
                    {isEditing ? (
                      <div className="admin-cell-stack">
                        {primaryImage ? (
                          <img className="admin-media-thumb" src={primaryImage} alt={row.name} />
                        ) : (
                          <span className="admin-badge">NO IMG</span>
                        )}
                        <input
                          className="admin-input"
                          value={(editing?.images ?? []).join(", ")}
                          onChange={(event) =>
                            setEditing((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    images: event.target.value
                                      .split(",")
                                      .map((item) => item.trim())
                                      .filter(Boolean),
                                  }
                                : prev,
                            )
                          }
                        />
                        <label className="btn btn-admin-outline">
                          Upload
                          <input
                            className="admin-file"
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={(event) => handleEditImageUpload(event.target.files?.[0])}
                          />
                        </label>
                      </div>
                    ) : primaryImage ? (
                      <img className="admin-media-thumb" src={primaryImage} alt={row.name} />
                    ) : (
                      <span className="admin-badge">NO IMG</span>
                    )}
                  </td>
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
                        <option value="draft">Bản nháp</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="archived">Lưu trữ</option>
                      </select>
                    ) : (
                      formatStatusLabel(row.status)
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
                      <span className="text-sm color-gray-500">Chỉ xem</span>
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

  const metrics = useMemo(
    () => [
      {
        label: "Tổng đơn",
        value: String(orders.length),
        note: "Toàn bộ giao dịch trong bộ vận hành.",
      },
      {
        label: "Đang hiển thị",
        value: String(filtered.length),
        note: search.trim() ? "Đã rút gọn theo bộ lọc." : "Danh sách giao dịch hiện tại.",
      },
      {
        label: "Cần xử lý",
        value: String(orders.filter((row) => ["new", "paid", "shipping"].includes(row.status ?? "")).length),
        note: "Đơn hàng còn trong luồng vận hành.",
      },
    ],
    [filtered.length, orders, search],
  );

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
      <AdminWorkspaceBanner
        eyebrow="Điều hành giao dịch"
        title="Đơn hàng là phân khu vận hành, không chỉ là một bảng dữ liệu."
        description="Theo dõi dòng giao dịch, cập nhật trạng thái và giữ góc nhìn tổng quan về những đơn chưa hoàn thành."
        metrics={metrics}
      />

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
            placeholder="ID người dùng (không bắt buộc)"
            value={form.user_id}
            onChange={(event) => setForm((prev) => ({ ...prev, user_id: event.target.value }))}
          />
          <input
            className="admin-input"
            placeholder="JSON sản phẩm"
            value={form.items}
            onChange={(event) => setForm((prev) => ({ ...prev, items: event.target.value }))}
          />
          <input
            className="admin-input"
            placeholder="Tạm tính"
            value={form.subtotal}
            onChange={(event) => setForm((prev) => ({ ...prev, subtotal: event.target.value }))}
          />
          <input
            className="admin-input"
            placeholder="Phí vận chuyển"
            value={form.shipping}
            onChange={(event) => setForm((prev) => ({ ...prev, shipping: event.target.value }))}
          />
          <select
            className="admin-select"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="new">Mới</option>
            <option value="paid">Đã thanh toán</option>
            <option value="shipping">Đang giao</option>
            <option value="done">Hoàn tất</option>
            <option value="cancelled">Đã hủy</option>
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
              <th>Người dùng</th>
              <th>Tạm tính</th>
              <th>Vận chuyển</th>
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
                        <option value="new">Mới</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="shipping">Đang giao</option>
                        <option value="done">Hoàn tất</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    ) : (
                      formatStatusLabel(row.status)
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
                      <span className="text-sm color-gray-500">Chỉ xem</span>
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
  const [form, setForm] = useState({ title: "", category: "", description: "", cover_image: "" });

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

  const metrics = useMemo(
    () => [
      {
        label: "Tổng bài viết",
        value: String(posts.length),
        note: "Số bài đang quản lý trong CMS dạng tệp.",
      },
      {
        label: "Đang hiển thị",
        value: String(filtered.length),
        note: search.trim() ? "Kết quả theo bộ lọc hiện tại." : "Tất cả bài đăng tải.",
      },
      {
        label: "Đã xuất bản",
        value: String(posts.filter((post) => post.published).length),
        note: "Bài đăng đã mở cho người dùng.",
      },
    ],
    [filtered.length, posts, search],
  );

  const handleCreate = async () => {
    if (!canEdit) return;
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        cover_image: form.cover_image,
      };
      const data = await fetchJson("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setPosts((prev) => [data.post, ...prev]);
      setForm({ title: "", category: "", description: "", cover_image: "" });
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
        cover_image: editing.cover_image,
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

  const handleCreateCoverUpload = async (file?: File | null) => {
    if (!file || !canEdit) return;
    setError(null);
    try {
      const url = await uploadAdminAsset("posts", file);
      setForm((prev) => ({ ...prev, cover_image: url }));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEditCoverUpload = async (file?: File | null) => {
    if (!file || !editing) return;
    setError(null);
    try {
      const url = await uploadAdminAsset("posts", file);
      setEditing((prev) => (prev ? { ...prev, cover_image: url } : prev));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="admin-panel mt-30">
      <AdminWorkspaceBanner
        eyebrow="Bàn biên tập"
        title="Blog trong admin được xem như một bàn xuất bản."
        description="Tập trung vào metadata và trạng thái xuất bản. Không đẩy người vận hành vào một biểu mẫu quá tải."
        metrics={metrics}
      />

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
          <input
            className="admin-input"
            placeholder="URL ảnh cover"
            value={form.cover_image}
            onChange={(event) => setForm((prev) => ({ ...prev, cover_image: event.target.value }))}
          />
          <label className="btn btn-admin-outline">
            Upload cover
            <input
              className="admin-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => handleCreateCoverUpload(event.target.files?.[0])}
            />
          </label>
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
              <th>Cover</th>
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
                <td colSpan={7}>Đang tải...</td>
              </tr>
            ) : null}
            {!loading && !filtered.length ? (
              <tr>
                <td colSpan={7}>Chưa có dữ liệu.</td>
              </tr>
            ) : null}
            {filtered.map((row) => {
              const isEditing = editing?.slug === row.slug;
              return (
                <tr key={row.slug}>
                  <td>
                    {isEditing ? (
                      <div className="admin-cell-stack">
                        {editing?.cover_image ? (
                          <img
                            className="admin-media-thumb"
                            src={editing.cover_image}
                            alt={editing.title}
                          />
                        ) : (
                          <span className="admin-badge">NO IMG</span>
                        )}
                        <input
                          className="admin-input"
                          value={editing?.cover_image ?? ""}
                          onChange={(event) =>
                            setEditing((prev) =>
                              prev ? { ...prev, cover_image: event.target.value } : prev,
                            )
                          }
                        />
                        <label className="btn btn-admin-outline">
                          Upload
                          <input
                            className="admin-file"
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={(event) => handleEditCoverUpload(event.target.files?.[0])}
                          />
                        </label>
                      </div>
                    ) : row.cover_image ? (
                      <img className="admin-media-thumb" src={row.cover_image} alt={row.title} />
                    ) : (
                      <span className="admin-badge">NO IMG</span>
                    )}
                  </td>
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
                        <option value="published">Đã xuất bản</option>
                        <option value="draft">Bản nháp</option>
                      </select>
                    ) : row.published ? (
                      "Đã xuất bản"
                    ) : (
                      "Bản nháp"
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
                      <span className="text-sm color-gray-500">Chỉ xem</span>
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

  const metrics = useMemo(
    () => [
      {
        label: "Tổng tệp",
        value: String(media.length),
        note: "Toàn bộ tài nguyên đã được đưa vào thư viện.",
      },
      {
        label: "Hình ảnh",
        value: String(media.filter((item) => item.type?.startsWith("image/")).length),
        note: "Tài nguyên hình ảnh sẵn sàng sử dụng.",
      },
      {
        label: "Tệp khác",
        value: String(media.filter((item) => !item.type?.startsWith("image/")).length),
        note: "PDF, video và các định dạng khác.",
      },
    ],
    [media],
  );

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
      <AdminWorkspaceBanner
        eyebrow="Thư viện tài nguyên"
        title="Thư viện media là kho kỹ thuật cần được theo dõi theo từng loại tài nguyên."
        description="Bố cục ưu tiên preview, tải lên nhanh và khả năng dọn dẹp những tài nguyên không còn cần thiết."
        metrics={metrics}
      />

      <div className="admin-toolbar">
        <div>
          <h4 className="color-white mb-5">Thư viện</h4>
          <p className="text-sm color-gray-500">Upload và quản lý tài nguyên hình ảnh / file.</p>
        </div>
        <div className="admin-toolbar__actions">
          {canEdit ? (
            <label className="btn btn-admin-outline">
              Tải lên
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
                      <span className="text-sm color-gray-500">Chỉ xem</span>
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
  const [filters, setFilters] = useState({
    search: "",
    action: "all",
    table: "all",
    sort: "desc",
    from: "",
    to: "",
  });

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

  const actions = useMemo(() => {
    const values = new Set(rows.map((row) => row.action).filter(Boolean));
    return Array.from(values).sort();
  }, [rows]);

  const tables = useMemo(() => {
    const values = new Set(rows.map((row) => row.table_name).filter(Boolean));
    return Array.from(values).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    let list = [...rows];
    const term = filters.search.trim().toLowerCase();
    if (term) {
      list = list.filter((row) =>
        [row.actor_email, row.action, row.table_name, row.record_id]
          .map((value) => String(value ?? "").toLowerCase())
          .some((value) => value.includes(term)),
      );
    }

    if (filters.action !== "all") {
      list = list.filter((row) => row.action === filters.action);
    }

    if (filters.table !== "all") {
      list = list.filter((row) => row.table_name === filters.table);
    }

    const fromTs = filters.from ? new Date(`${filters.from}T00:00:00`).getTime() : null;
    const toTs = filters.to ? new Date(`${filters.to}T23:59:59`).getTime() : null;
    if (fromTs) {
      list = list.filter((row) => new Date(row.created_at).getTime() >= fromTs);
    }
    if (toTs) {
      list = list.filter((row) => new Date(row.created_at).getTime() <= toTs);
    }

    list.sort((a, b) => {
      const left = new Date(a.created_at).getTime();
      const right = new Date(b.created_at).getTime();
      return filters.sort === "asc" ? left - right : right - left;
    });

    return list;
  }, [rows, filters]);

  const metrics = useMemo(
    () => [
      {
        label: "Tổng nhật ký",
        value: String(rows.length),
        note: "Toàn bộ bản ghi truy vết trong phiên hiện tại.",
      },
      {
        label: "Đang lọc",
        value: String(filtered.length),
        note: "Số dòng còn lại sau bộ điều kiện.",
      },
      {
        label: "Nhóm bảng",
        value: String(tables.length),
        note: "Số vùng dữ liệu đang được theo dõi.",
      },
    ],
    [filtered.length, rows.length, tables.length],
  );

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("vi-VN");
  };

  const resetFilters = () =>
    setFilters({ search: "", action: "all", table: "all", sort: "desc", from: "", to: "" });

  return (
    <div className="admin-panel mt-30">
      <AdminWorkspaceBanner
        eyebrow="Dòng truy vết"
        title="Nhật ký kiểm soát được tách thành một vùng truy vết riêng."
        description="Giữ cho thao tác kiểm soát có bộ lọc rõ ràng, để tìm thấy biến động thay vì đọc một bảng dài."
        metrics={metrics}
      />

      <div className="admin-toolbar">
        <div>
          <h4 className="color-white mb-5">Nhật ký hệ thống</h4>
          <p className="text-sm color-gray-500">Theo dõi các thay đổi quan trọng trong admin.</p>
        </div>
        <div className="admin-toolbar__actions">
          <button className="btn btn-admin-outline" onClick={loadAudit} type="button">
            Làm mới
          </button>
        </div>
      </div>

      <div className="admin-form-grid mt-20">
        <input
          className="admin-input"
          placeholder="Tìm theo email, hành động, bảng, ID"
          value={filters.search}
          onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
        />
        <select
          className="admin-select"
          value={filters.action}
          onChange={(event) => setFilters((prev) => ({ ...prev, action: event.target.value }))}
        >
          <option value="all">Tất cả hành động</option>
          {actions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
        <select
          className="admin-select"
          value={filters.table}
          onChange={(event) => setFilters((prev) => ({ ...prev, table: event.target.value }))}
        >
          <option value="all">Tất cả bảng</option>
          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>
        <input
          className="admin-input"
          type="date"
          value={filters.from}
          onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
        />
        <input
          className="admin-input"
          type="date"
          value={filters.to}
          onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
        />
        <select
          className="admin-select"
          value={filters.sort}
          onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}
        >
          <option value="desc">Mới nhất</option>
          <option value="asc">Cũ nhất</option>
        </select>
        <button className="btn btn-admin-outline" onClick={resetFilters} type="button">
          Đặt lại
        </button>
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
            {!loading && !filtered.length ? (
              <tr>
                <td colSpan={5}>Chưa có dữ liệu.</td>
              </tr>
            ) : null}
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{formatDateTime(row.created_at)}</td>
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
