"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeSwitch } from "@/components/elements/SwitchButton";
import { useSessionUser } from "@/components/auth/useSessionUser";
import { hasGidValue } from "@/lib/utils/gid";
import styles from "./HeaderUserMenu.module.css";

export function HeaderUserMenu() {
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
      { href: "/account", label: "Thông tin tài khoản" },
      ...(isAdmin
        ? [
            { href: "/admin", label: "Trang quản trị" },
            { href: "/admin/database", label: "Cơ sở dữ liệu" },
          ]
        : []),
    ],
    [isAdmin],
  );

  if (!isLoaded || !user) {
    return (
      <div className={styles.root} aria-hidden="true">
        <span className={`${styles.trigger} ${styles.triggerPlaceholder}`} />
      </div>
    );
  }

  return (
    <div className={styles.root} ref={menuRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Mở menu tài khoản"
      >
        {avatarUrl ? (
          <img className={styles.avatar} src={avatarUrl} alt={displayName} width="34" height="34" />
        ) : (
          <span className={`${styles.avatar} ${styles.avatarFallback}`}>
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {open ? (
        <div className={styles.dropdown}>
          <div className={styles.profile}>
            <div className={styles.profileMeta}>
              <strong>{displayName}</strong>
              <p>{user.email}</p>
              <span className={styles.roleBadge}>
                {isAdmin ? "Quản trị viên" : "Người dùng"}
              </span>
              {hasGidValue(user.gid) ? <small className={styles.gid}>{user.gid}</small> : null}
            </div>
          </div>

          <div className={styles.links}>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.link}
                onClick={() => setOpen(false)}
              >
                <span className={styles.linkLabel}>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className={styles.themeSection}>
            <ThemeSwitch />
          </div>

          <button
            type="button"
            className={styles.signout}
            onClick={() => window.location.assign("/logout")}
          >
            Đăng xuất
          </button>
        </div>
      ) : null}
    </div>
  );
}
