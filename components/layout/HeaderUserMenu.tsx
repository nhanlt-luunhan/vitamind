"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { ThemeSwitch } from "@/components/elements/SwitchButton";
import styles from "./HeaderUserMenu.module.css";

type AccountSession = {
  id: string;
  email: string;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  role: string | null;
  status: string | null;
  avatar_url: string | null;
};

const fallbackAdminEmail = "nhanlt.luunhan@gmail.com";

export function HeaderUserMenu() {
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
          <img
            className={styles.avatar}
            src={avatarUrl}
            alt={displayName}
            width="40"
            height="40"
          />
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
              <p>{sessionUser?.email ?? primaryEmail}</p>
              <span className={styles.roleBadge}>
                {isAdmin ? "Quản trị viên" : "Người dùng"}
              </span>
              {gid ? <small className={styles.gid}>{gid}</small> : null}
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
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            Đăng xuất
          </button>
        </div>
      ) : null}
    </div>
  );
}
