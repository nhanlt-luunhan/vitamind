"use client";

import { useMemo, useState } from "react";
import styles from "./DatabaseAccessWorkbench.module.css";

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

type AccessPayload = {
  permissions: AccessPermission[];
  groups: AccessGroup[];
};

type PermissionForm = {
  id: string | null;
  code: string;
  name: string;
  description: string;
};

type GroupForm = {
  id: string | null;
  code: string;
  name: string;
  description: string;
  permission_ids: string[];
};

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "Khong the tai du lieu.");
  }

  return data as T;
}

const emptyPermissionForm: PermissionForm = {
  id: null,
  code: "",
  name: "",
  description: "",
};

const emptyGroupForm: GroupForm = {
  id: null,
  code: "",
  name: "",
  description: "",
  permission_ids: [],
};

type Props = {
  initialPermissions: AccessPermission[];
  initialGroups: AccessGroup[];
  onUpdated?: (payload: AccessPayload) => void;
};

export function DatabaseAccessWorkbench({ initialPermissions, initialGroups, onUpdated }: Props) {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [groups, setGroups] = useState(initialGroups);
  const [permissionForm, setPermissionForm] = useState<PermissionForm>(emptyPermissionForm);
  const [groupForm, setGroupForm] = useState<GroupForm>(emptyGroupForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sortedPermissions = useMemo(
    () => [...permissions].sort((left, right) => left.name.localeCompare(right.name, "vi")),
    [permissions],
  );

  const applyPayload = (payload: AccessPayload) => {
    setPermissions(payload.permissions ?? []);
    setGroups(payload.groups ?? []);
    onUpdated?.(payload);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin-access-updated"));
    }
  };

  const handlePermissionSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = await fetchJson<AccessPayload>("/api/admin/access", {
        method: permissionForm.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "permission",
          id: permissionForm.id,
          code: permissionForm.code,
          name: permissionForm.name,
          description: permissionForm.description,
        }),
      });

      applyPayload(payload);
      setPermissionForm(emptyPermissionForm);
      setSuccess(permissionForm.id ? "Da cap nhat permission." : "Da tao permission.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGroupSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = await fetchJson<AccessPayload>("/api/admin/access", {
        method: groupForm.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "group",
          id: groupForm.id,
          code: groupForm.code,
          name: groupForm.name,
          description: groupForm.description,
          permission_ids: groupForm.permission_ids,
        }),
      });

      applyPayload(payload);
      setGroupForm(emptyGroupForm);
      setSuccess(groupForm.id ? "Da cap nhat group." : "Da tao group.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermissionInGroup = (permissionId: string) => {
    setGroupForm((current) => ({
      ...current,
      permission_ids: current.permission_ids.includes(permissionId)
        ? current.permission_ids.filter((value) => value !== permissionId)
        : [...current.permission_ids, permissionId],
    }));
  };

  return (
    <div className={styles.root}>
      <section className={styles.intro}>
        <strong>Quyen duoc tao truoc, sau do moi gan vao group hoac user.</strong>
        <p>
          Dashboard nay tach rieng phan khai bao permission va group. User dashboard se doc cac muc
          nay de gan truc tiep cho user hoac dua user vao group.
        </p>
      </section>

      {error ? <div className={styles.feedbackError}>{error}</div> : null}
      {success ? <div className={styles.feedbackSuccess}>{success}</div> : null}

      <div className={styles.grid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3>Permission registry</h3>
              <p>Tao permission de sau do gan vao group hoac user.</p>
            </div>
            <span className={styles.count}>{permissions.length} quyen</span>
          </div>

          <div className={styles.list}>
            {sortedPermissions.map((permission) => (
              <button
                key={permission.id}
                type="button"
                className={`${styles.itemButton} ${permissionForm.id === permission.id ? styles.itemActive : ""}`}
                onClick={() =>
                  setPermissionForm({
                    id: permission.id,
                    code: permission.code,
                    name: permission.name,
                    description: permission.description ?? "",
                  })
                }
              >
                <strong>{permission.name}</strong>
                <span>{permission.code}</span>
                <small>{permission.description ?? "Khong co mo ta"}</small>
              </button>
            ))}
          </div>

          <div className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="permission-code">Code</label>
              <input
                id="permission-code"
                value={permissionForm.code}
                onChange={(event) => setPermissionForm((current) => ({ ...current, code: event.target.value }))}
                placeholder="users.manage"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="permission-name">Ten</label>
              <input
                id="permission-name"
                value={permissionForm.name}
                onChange={(event) => setPermissionForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Quan ly user"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="permission-description">Mo ta</label>
              <textarea
                id="permission-description"
                value={permissionForm.description}
                onChange={(event) =>
                  setPermissionForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>
            <div className={styles.actions}>
              <button className={styles.secondaryButton} type="button" onClick={() => setPermissionForm(emptyPermissionForm)}>
                Dat lai
              </button>
              <button className={styles.primaryButton} type="button" onClick={handlePermissionSubmit} disabled={submitting}>
                {permissionForm.id ? "Cap nhat permission" : "Tao permission"}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3>Groups</h3>
              <p>Tao nhom, chon permissions cho nhom, roi gan nhom cho user.</p>
            </div>
            <span className={styles.count}>{groups.length} nhom</span>
          </div>

          <div className={styles.list}>
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                className={`${styles.itemButton} ${groupForm.id === group.id ? styles.itemActive : ""}`}
                onClick={() =>
                  setGroupForm({
                    id: group.id,
                    code: group.code,
                    name: group.name,
                    description: group.description ?? "",
                    permission_ids: group.permissions.map((permission) => permission.id),
                  })
                }
              >
                <strong>{group.name}</strong>
                <span>{group.code}</span>
                <small>{group.permissions.length} permission dang gan</small>
              </button>
            ))}
          </div>

          <div className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="group-code">Code</label>
              <input
                id="group-code"
                value={groupForm.code}
                onChange={(event) => setGroupForm((current) => ({ ...current, code: event.target.value }))}
                placeholder="admins"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="group-name">Ten nhom</label>
              <input
                id="group-name"
                value={groupForm.name}
                onChange={(event) => setGroupForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Administrators"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="group-description">Mo ta</label>
              <textarea
                id="group-description"
                value={groupForm.description}
                onChange={(event) => setGroupForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Permissions trong group</label>
              <div className={styles.selectionGrid}>
                {sortedPermissions.map((permission) => {
                  const active = groupForm.permission_ids.includes(permission.id);
                  return (
                    <button
                      key={permission.id}
                      type="button"
                      className={`${styles.permissionCard} ${active ? styles.permissionCardActive : ""}`}
                      onClick={() => togglePermissionInGroup(permission.id)}
                    >
                      <strong>{permission.name}</strong>
                      <span>{permission.code}</span>
                      <small>{permission.description ?? "Khong co mo ta"}</small>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.secondaryButton} type="button" onClick={() => setGroupForm(emptyGroupForm)}>
                Dat lai
              </button>
              <button className={styles.primaryButton} type="button" onClick={handleGroupSubmit} disabled={submitting}>
                {groupForm.id ? "Cap nhat group" : "Tao group"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
