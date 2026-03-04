"use client";

import { useDeferredValue, useEffect, useState } from "react";
import styles from "./UserListView.module.css";

type AccessPermission = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

type AccessGroup = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  permissions: AccessPermission[];
};

type UserAuditItem = {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  actor_email: string | null;
  created_at: string;
};

type UserRecord = {
  id: string;
  email: string;
  contact_email: string | null;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  role: string | null;
  status: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
  groups: AccessGroup[];
  permissions: AccessPermission[];
  effective_permissions: AccessPermission[];
};

type UserDraft = Omit<UserRecord, "groups" | "permissions" | "effective_permissions"> & {
  group_ids: string[];
  permission_ids: string[];
  effective_permissions: AccessPermission[];
};

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "Không thể tải dữ liệu.");
  }

  return data as T;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function roleLabel(role: string | null) {
  if (role === "admin") return "Quản trị";
  if (role === "editor") return "Biên tập";
  return "Xem";
}

function statusLabel(status: string | null) {
  if (status === "blocked" || status === "disabled") return "Bị khóa";
  return "Hoạt động";
}

function actionLabel(action: string) {
  if (action === "create") return "Tạo";
  if (action === "update") return "Cập nhật";
  if (action === "delete") return "Xóa";
  return action;
}

function createDraft(user: UserRecord): UserDraft {
  return {
    ...user,
    group_ids: user.groups.map((group) => group.id),
    permission_ids: user.permissions.map((permission) => permission.id),
    effective_permissions: user.effective_permissions,
  };
}

export function UserListView() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [groups, setGroups] = useState<AccessGroup[]>([]);
  const [permissions, setPermissions] = useState<AccessPermission[]>([]);
  const [audit, setAudit] = useState<UserAuditItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<UserDraft | null>(null);
  const deferredSearch = useDeferredValue(search);

  const loadShellData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [usersData, accessData] = await Promise.all([
        fetchJson<{ users: UserRecord[] }>("/api/admin/users?limit=200"),
        fetchJson<{ groups: AccessGroup[]; permissions: AccessPermission[] }>("/api/admin/access"),
      ]);

      const nextUsers = usersData.users ?? [];
      setUsers(nextUsers);
      setGroups(accessData.groups ?? []);
      setPermissions(accessData.permissions ?? []);
      setSelectedId((current) => {
        if (current && nextUsers.some((user) => user.id === current)) return current;
        return nextUsers[0]?.id ?? null;
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShellData();
  }, []);

  useEffect(() => {
    const handleAccessUpdated = () => {
      loadShellData();
    };

    window.addEventListener("admin-access-updated", handleAccessUpdated);
    return () => window.removeEventListener("admin-access-updated", handleAccessUpdated);
  }, []);

  const filteredUsers = users.filter((user) => {
    const term = deferredSearch.trim().toLowerCase();
    if (!term) return true;

    return [
      user.email,
      user.contact_email,
      user.name,
      user.display_name,
      user.phone,
      user.gid,
      user.role,
      user.status,
      ...user.groups.map((group) => group.name),
      ...user.effective_permissions.map((permission) => permission.code),
    ].some((value) => String(value ?? "").toLowerCase().includes(term));
  });

  useEffect(() => {
    if (!filteredUsers.length) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !filteredUsers.some((user) => user.id === selectedId)) {
      setSelectedId(filteredUsers[0].id);
    }
  }, [filteredUsers, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setDraft(null);
      setAudit([]);
      return;
    }

    let cancelled = false;

    const loadDetail = async () => {
      setDetailLoading(true);
      setError(null);

      try {
        const data = await fetchJson<{ user: UserRecord; audit: UserAuditItem[] }>(`/api/admin/users/${selectedId}`);
        if (cancelled) return;

        setDraft(createDraft(data.user));
        setAudit(data.audit ?? []);
        setUsers((current) => current.map((item) => (item.id === data.user.id ? data.user : item)));
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleChange = <K extends keyof UserDraft>(key: K, value: UserDraft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setSuccess(null);
  };

  const toggleMembership = (key: "group_ids" | "permission_ids", id: string) => {
    setDraft((current) => {
      if (!current) return current;

      const nextValues = current[key].includes(id)
        ? current[key].filter((value) => value !== id)
        : [...current[key], id];

      return { ...current, [key]: nextValues };
    });
  };

  const handleReset = async () => {
    if (!selectedId) return;

    setError(null);
    setSuccess(null);

    try {
      const data = await fetchJson<{ user: UserRecord; audit: UserAuditItem[] }>(`/api/admin/users/${selectedId}`);
      setDraft(createDraft(data.user));
      setAudit(data.audit ?? []);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSave = async () => {
    if (!draft) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await fetchJson<{ user: UserRecord; audit: UserAuditItem[] }>(`/api/admin/users/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          display_name: draft.display_name,
          contact_email: draft.contact_email,
          phone: draft.phone,
          gid: draft.gid,
          role: draft.role,
          status: draft.status,
          company: draft.company,
          location: draft.location,
          website: draft.website,
          bio: draft.bio,
          group_ids: draft.group_ids,
          permission_ids: draft.permission_ids,
        }),
      });

      setUsers((current) => current.map((user) => (user.id === draft.id ? data.user : user)));
      setDraft(createDraft(data.user));
      setAudit(data.audit ?? []);
      setSuccess("Đã cập nhật người dùng.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: UserRecord) => {
    if (!window.confirm(`Xóa user ${user.email}?`)) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await fetchJson(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const remaining = users.filter((item) => item.id !== user.id);
      setUsers(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      setDraft(null);
      setAudit([]);
      setSuccess("Đã xóa người dùng.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.stack}>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center border-bottom flex-wrap gap-3">
          <div className={styles.cardHeaderCopy}>
            <h4 className="mb-0">Danh sách người dùng</h4>
            <p>Áp dụng bố cục customer list view của Lahomes cho dữ liệu user của Vitamind.</p>
          </div>
          <div className={styles.toolbar}>
            <input
              className={styles.search}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo email, tên, nhóm, quyền"
            />
            <button
              className="btn btn-sm btn-outline-light rounded"
              type="button"
              onClick={loadShellData}
              disabled={loading}
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle text-nowrap table-hover table-centered mb-0">
              <thead className="bg-light-subtle">
                <tr>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Liên hệ</th>
                  <th>Nhóm</th>
                  <th>Vai trò</th>
                  <th>Quyền</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className={styles.empty}>
                      Đang tải danh sách user...
                    </td>
                  </tr>
                ) : null}

                {!loading && !filteredUsers.length ? (
                  <tr>
                    <td colSpan={9} className={styles.empty}>
                      Không có user phù hợp.
                    </td>
                  </tr>
                ) : null}

                {!loading
                  ? filteredUsers.map((user) => {
                      const displayName = user.display_name ?? user.name ?? user.email;
                      const initials = displayName.charAt(0).toUpperCase();
                      const blocked = user.status === "blocked" || user.status === "disabled";
                      const isSelected = selectedId === user.id;

                      return (
                        <tr
                          key={user.id}
                          className={isSelected ? styles.rowSelected : undefined}
                          onClick={() => setSelectedId(user.id)}
                        >
                          <td>
                            <div className={styles.nameCell}>
                              {user.avatar_url ? (
                                <img className={styles.avatar} src={user.avatar_url} alt={displayName} />
                              ) : (
                                <span className={styles.avatarFallback}>{initials}</span>
                              )}
                              <div className={styles.nameMeta}>
                                <strong>{displayName}</strong>
                                <span>{user.gid ?? "Chưa có GID"}</span>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.phone ?? user.contact_email ?? "-"}</td>
                          <td>
                            {user.groups.length ? (
                              <div className={styles.multiMeta}>
                                <span className={styles.badgeGroup}>{user.groups[0].name}</span>
                                {user.groups.length > 1 ? <small>+{user.groups.length - 1} nhóm</small> : null}
                              </div>
                            ) : (
                              <span className={styles.muted}>Chưa vào nhóm</span>
                            )}
                          </td>
                          <td>
                            <span className={styles.badgeRole}>{roleLabel(user.role)}</span>
                          </td>
                          <td>
                            <span className={styles.badgePermission}>
                              {user.effective_permissions.length} quyền
                            </span>
                          </td>
                          <td>
                            <span className={`${styles.badgeStatus} ${blocked ? styles.badgeStatusBlocked : ""}`}>
                              {statusLabel(user.status)}
                            </span>
                          </td>
                          <td>{formatDate(user.updated_at ?? user.created_at)}</td>
                          <td>
                            <div className={styles.actions} onClick={(event) => event.stopPropagation()}>
                              <button className="btn btn-light btn-sm" type="button" onClick={() => setSelectedId(user.id)}>
                                Xem
                              </button>
                              <button
                                className="btn btn-soft-primary btn-sm"
                                type="button"
                                onClick={() => setSelectedId(user.id)}
                              >
                                Sửa
                              </button>
                              <button
                                className="btn btn-soft-danger btn-sm"
                                type="button"
                                onClick={() => handleDelete(user)}
                                disabled={deleting}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.tableFooter}>
          <span>
            Hiển thị <strong>{filteredUsers.length}</strong> trên tổng <strong>{users.length}</strong> người dùng
          </span>
          <span>
            Nhóm: <strong>{groups.length}</strong> | Quyền: <strong>{permissions.length}</strong>
          </span>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.panel}>
          {detailLoading ? <div className={styles.empty}>Đang tải chi tiết người dùng...</div> : null}
          {!detailLoading && !draft ? <div className={styles.empty}>Chọn một user trong bảng để chỉnh sửa.</div> : null}

          {!detailLoading && draft ? (
            <>
              <div className={styles.summary}>
                {draft.avatar_url ? (
                  <img className={styles.avatar} src={draft.avatar_url} alt={draft.display_name ?? draft.email} />
                ) : (
                  <span className={styles.avatarFallback}>
                    {(draft.display_name ?? draft.name ?? draft.email).charAt(0).toUpperCase()}
                  </span>
                )}
                <div className={styles.summaryCopy}>
                  <h5>{draft.display_name ?? draft.name ?? draft.email}</h5>
                  <p>{draft.email}</p>
                  <div className={styles.summaryMeta}>
                    <span>Cập nhật: {formatDate(draft.updated_at ?? draft.created_at)}</span>
                  </div>
                </div>
              </div>

              {error ? <div className={styles.feedbackError}>{error}</div> : null}
              {success ? <div className={styles.feedbackSuccess}>{success}</div> : null}

              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor="vitamind-user-display-name">Tên hiển thị</label>
                  <input
                    id="vitamind-user-display-name"
                    value={draft.display_name ?? ""}
                    onChange={(event) => handleChange("display_name", event.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="vitamind-user-name">Tên thật</label>
                  <input
                    id="vitamind-user-name"
                    value={draft.name ?? ""}
                    onChange={(event) => handleChange("name", event.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="vitamind-user-email">Email đăng nhập</label>
                  <input id="vitamind-user-email" value={draft.email} disabled />
                </div>

                <div className={styles.field}>
                  <label htmlFor="vitamind-user-contact-email">Email liên hệ</label>
                  <input
                    id="vitamind-user-contact-email"
                    value={draft.contact_email ?? ""}
                    onChange={(event) => handleChange("contact_email", event.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="vitamind-user-role">Vai trò</label>
                  <select
                    id="vitamind-user-role"
                    value={draft.role ?? "viewer"}
                    onChange={(event) => handleChange("role", event.target.value)}
                  >
                    <option value="admin">Quản trị</option>
                    <option value="editor">Biên tập</option>
                    <option value="viewer">Xem</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label htmlFor="vitamind-user-status">Trạng thái</label>
                  <select
                    id="vitamind-user-status"
                    value={draft.status === "disabled" ? "blocked" : draft.status ?? "active"}
                    onChange={(event) => handleChange("status", event.target.value)}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="blocked">Bị khóa</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label htmlFor="vitamind-user-gid">GID</label>
                  <input
                    id="vitamind-user-gid"
                    value={draft.gid ?? ""}
                    onChange={(event) => handleChange("gid", event.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="vitamind-user-phone">Điện thoại</label>
                  <input
                    id="vitamind-user-phone"
                    value={draft.phone ?? ""}
                    onChange={(event) => handleChange("phone", event.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="vitamind-user-company">Công ty</label>
                  <input
                    id="vitamind-user-company"
                    value={draft.company ?? ""}
                    onChange={(event) => handleChange("company", event.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="vitamind-user-location">Địa điểm</label>
                  <input
                    id="vitamind-user-location"
                    value={draft.location ?? ""}
                    onChange={(event) => handleChange("location", event.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="vitamind-user-website">Website</label>
                  <input
                    id="vitamind-user-website"
                    value={draft.website ?? ""}
                    onChange={(event) => handleChange("website", event.target.value)}
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label htmlFor="vitamind-user-bio">Giới thiệu</label>
                  <textarea
                    id="vitamind-user-bio"
                    value={draft.bio ?? ""}
                    onChange={(event) => handleChange("bio", event.target.value)}
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label>Nhóm</label>
                  <div className={styles.selectionGrid}>
                    {groups.map((group) => {
                      const active = draft.group_ids.includes(group.id);

                      return (
                        <button
                          key={group.id}
                          type="button"
                          className={`${styles.selectionCard} ${active ? styles.selectionCardActive : ""}`}
                          onClick={() => toggleMembership("group_ids", group.id)}
                        >
                          <strong>{group.name}</strong>
                          <span>{group.code}</span>
                          <small>{group.permissions.length} quyền</small>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label>Quyền riêng</label>
                  <div className={styles.selectionGrid}>
                    {permissions.map((permission) => {
                      const active = draft.permission_ids.includes(permission.id);

                      return (
                        <button
                          key={permission.id}
                          type="button"
                          className={`${styles.selectionCard} ${active ? styles.selectionCardActive : ""}`}
                          onClick={() => toggleMembership("permission_ids", permission.id)}
                        >
                          <strong>{permission.name}</strong>
                          <span>{permission.code}</span>
                          <small>{permission.description ?? "Chưa có mô tả"}</small>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.footerActions}>
                <button className="btn btn-outline-light" type="button" onClick={handleReset} disabled={saving}>
                  Đặt lại
                </button>
                <button className="btn btn-primary" type="button" onClick={handleSave} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu người dùng"}
                </button>
              </div>
            </>
          ) : null}
        </section>

        <aside className={styles.auditPanel}>
          <div className={styles.cardHeaderCopy}>
            <h5 className="mb-0">Lịch sử cập nhật</h5>
            <p>Bản ghi audit của user đang được chọn.</p>
          </div>
          <div className={styles.auditList}>
            {audit.length ? (
              audit.map((item) => (
                <article key={item.id} className={styles.auditItem}>
                  <strong>{actionLabel(item.action)}</strong>
                  <span>{item.actor_email ?? "Hệ thống"}</span>
                  <small>{formatDate(item.created_at)}</small>
                </article>
              ))
            ) : (
              <div className={styles.empty}>Chưa có lịch sử audit.</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
