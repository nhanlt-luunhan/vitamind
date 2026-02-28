"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import styles from "./AdminUserMenu.module.css";

type AccountSession = {
  email: string;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  role: string | null;
  avatar_url: string | null;
};

type AdminUserMenuProps = {
  onLock: () => void;
};

const fallbackAdminEmail = "nhanlt.luunhan@gmail.com";

export function AdminUserMenu({ onLock }: AdminUserMenuProps) {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const [open, setOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<AccountSession | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    let ignore = false;
    fetch("/api/account/profile", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json();
        return (data?.user as AccountSession | null) ?? null;
      })
      .then((data) => {
        if (!ignore && data) {
          setSessionUser(data);
        }
      })
      .catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, [isLoaded, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const primaryEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null;
  const displayName =
    sessionUser?.display_name ??
    sessionUser?.name ??
    user?.fullName ??
    primaryEmail?.split("@")[0] ??
    "Tài khoản";
  const avatarUrl = user?.imageUrl ?? sessionUser?.avatar_url ?? null;
  const role =
    sessionUser?.role ??
    (typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role : null);
  const gid =
    sessionUser?.gid ??
    (typeof user?.publicMetadata?.gid === "string" ? user.publicMetadata.gid : null);
  const isAdmin = role === "admin" || primaryEmail === fallbackAdminEmail;

  const menuItems = useMemo(
    () => [
      {
        href: "/account",
        label: "My Schedules",
        note: "Hồ sơ, thông tin liên hệ và trạng thái tài khoản.",
        icon: "ri-calendar-2-line",
      },
      {
        href: isAdmin ? "/admin" : "/account",
        label: "Pricing",
        note: isAdmin ? "Quay về bảng điều khiển quản trị." : "Vùng thao tác chính của tài khoản.",
        icon: "ri-wallet-3-line",
      },
      {
        href: "/admin/database",
        label: "Help",
        note: "Mở nhanh vùng công cụ và dữ liệu hệ thống.",
        icon: "ri-lifebuoy-line",
      },
    ],
    [isAdmin],
  );

  if (!isLoaded || !user) return null;

  return (
    <div className={styles.root} ref={menuRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Mở menu tài khoản admin"
      >
        {avatarUrl ? (
          <img className={styles.avatar} src={avatarUrl} alt={displayName} />
        ) : (
          <span className={`${styles.avatar} ${styles.avatarFallback}`}>
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {open ? (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <strong className={styles.headerTitle} title={displayName}>
              Welcome {displayName}!
            </strong>
            <div className={styles.headerMeta}>
              <span className={styles.metaItem} title={sessionUser?.email ?? primaryEmail ?? ""}>
                <span className={styles.metaValue}>{sessionUser?.email ?? primaryEmail}</span>
              </span>
              <span className={styles.metaItem}>
                {gid ? `GID ${gid}` : isAdmin ? "Admin access" : "User access"}
              </span>
            </div>
          </div>

          <div className={styles.links}>
            {menuItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={styles.link}
                onClick={() => setOpen(false)}
              >
                <i className={item.icon} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            ))}

            <button
              type="button"
              className={styles.link}
              onClick={() => {
                setOpen(false);
                onLock();
              }}
            >
              <i className="ri-lock-password-line" aria-hidden="true" />
              <span>Lock screen</span>
            </button>
          </div>

          <button
            type="button"
            className={styles.signout}
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            <i className="ri-logout-box-r-line" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
