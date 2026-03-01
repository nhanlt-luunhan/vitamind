"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSessionUser } from "@/components/auth/useSessionUser";
import { hasGidValue } from "@/lib/utils/gid";
import styles from "./AdminUserMenu.module.css";

type AdminUserMenuProps = {
  onLock: () => void;
};

export function AdminUserMenu({ onLock }: AdminUserMenuProps) {
  const { user, isLoaded } = useSessionUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const displayName =
    user?.display_name ??
    user?.name ??
    user?.email?.split("@")[0] ??
    "Tài khoản";
  const avatarUrl = user?.avatar_url ?? null;
  const isAdmin = user?.role === "admin";

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
              <span className={styles.metaItem} title={user.email}>
                <span className={styles.metaValue}>{user.email}</span>
              </span>
              <span className={styles.metaItem}>
                {hasGidValue(user.gid) ? user.gid : isAdmin ? "Admin access" : "User access"}
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
            onClick={() => window.location.assign("/logout")}
          >
            <i className="ri-logout-box-r-line" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
