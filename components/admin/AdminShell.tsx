"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useTheme } from "@/components/providers/ThemeProvider";
import { AdminUserMenu } from "@/components/admin/AdminUserMenu";
import styles from "./AdminShell.module.css";

export type AdminNavKey =
  | "dashboard"
  | "database"
  | "account"
  | "users"
  | "products"
  | "orders"
  | "blog"
  | "media"
  | "audit";

type AdminShellProps = {
  activeItem: AdminNavKey;
  children: React.ReactNode;
};

type AdminMenuItem = {
  href: string;
  label: string;
  icon: string;
  key: AdminNavKey | null;
  keywords: string[];
};

type AdminMenuSection = {
  title: string;
  items: AdminMenuItem[];
};

const adminMenu: AdminMenuSection[] = [
  {
    title: "Tổng quan",
    items: [
      {
        href: "/admin",
        label: "Bảng điều khiển",
        icon: "ri-dashboard-line",
        key: "dashboard",
        keywords: ["dashboard", "tong quan", "bang dieu khien", "overview"],
      },
      {
        href: "/account",
        label: "Tài khoản",
        icon: "ri-user-settings-line",
        key: "account",
        keywords: ["tai khoan", "account", "profile", "ho so"],
      },
      {
        href: "/admin/database",
        label: "Cơ sở dữ liệu",
        icon: "ri-database-2-line",
        key: "database",
        keywords: ["database", "db", "du lieu", "co so du lieu", "adminer"],
      },
    ],
  },
  {
    title: "Vận hành",
    items: [
      {
        href: "/admin?tab=users",
        label: "Người dùng",
        icon: "ri-team-line",
        key: "users",
        keywords: ["user", "users", "nguoi dung", "thanh vien"],
      },
      {
        href: "/admin?tab=products",
        label: "Sản phẩm",
        icon: "ri-store-2-line",
        key: "products",
        keywords: ["product", "products", "san pham", "sku"],
      },
      {
        href: "/admin?tab=orders",
        label: "Đơn hàng",
        icon: "ri-shopping-bag-3-line",
        key: "orders",
        keywords: ["order", "orders", "don hang", "giao dich"],
      },
      {
        href: "/admin?tab=blog",
        label: "Blog",
        icon: "ri-article-line",
        key: "blog",
        keywords: ["blog", "post", "posts", "bai viet", "noi dung"],
      },
      {
        href: "/admin?tab=media",
        label: "Thư viện",
        icon: "ri-image-circle-line",
        key: "media",
        keywords: ["media", "thu vien", "image", "images", "tep"],
      },
      {
        href: "/admin?tab=audit",
        label: "Nhật ký",
        icon: "ri-file-chart-line",
        key: "audit",
        keywords: ["audit", "nhat ky", "log", "logs", "lich su"],
      },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      {
        href: "/",
        label: "Trang chủ",
        icon: "ri-home-5-line",
        key: null,
        keywords: ["home", "trang chu", "website"],
      },
    ],
  },
];

const notificationLinks = [
  {
    href: "/admin?tab=orders",
    label: "Đơn hàng cần theo dõi",
    note: "Mở nhanh phân khu đơn hàng trong dashboard.",
  },
  {
    href: "/admin?tab=audit",
    label: "Nhật ký hệ thống",
    note: "Kiểm tra thay đổi quan trọng và actor gần nhất.",
  },
  {
    href: "/admin/database",
    label: "Console dữ liệu",
    note: "Đi vào Adminer qua proxy nội bộ.",
  },
];

export function AdminShell({ activeItem, children }: AdminShellProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { resolvedTheme, setThemeMode } = useTheme();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isLocked, setLocked] = useState(false);
  const [lockPassword, setLockPassword] = useState("");
  const [lockError, setLockError] = useState("");
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const lockInputRef = useRef<HTMLInputElement | null>(null);

  const flattenedMenu = useMemo(() => adminMenu.flatMap((section) => section.items), []);
  const lockName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress?.split("@")[0] ?? "Admin";
  const lockAvatar = user?.imageUrl ?? null;
  const adminLogo =
    resolvedTheme === "night"
      ? "/assets/imgs/template/vitamind-night.svg"
      : "/assets/imgs/template/vitamind-day.svg";
  const sidebarLogo = isSidebarCollapsed
    ? "/assets/imgs/template/icons/vitamind-short.png"
    : adminLogo;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!controlsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin-shell-locked");
    if (stored === "1") {
      setLocked(true);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("admin-shell-locked", isLocked ? "1" : "0");
    if (isLocked) {
      window.setTimeout(() => {
        lockInputRef.current?.focus();
      }, 60);
    }
  }, [isLocked]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchValue.trim().toLowerCase();
    if (!query) return;

    const match =
      flattenedMenu.find((item) => item.label.toLowerCase().includes(query)) ??
      flattenedMenu.find((item) => item.key === activeItem) ??
      flattenedMenu.find((item) => item.keywords.some((keyword) => keyword.includes(query))) ??
      flattenedMenu.find((item) => item.keywords.some((keyword) => query.includes(keyword)));

    if (!match) return;

    setSearchValue("");
    router.push(match.href);
  };

  const toggleTheme = () => {
    setThemeMode(resolvedTheme === "night" ? "day" : "night");
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }

    await document.documentElement.requestFullscreen().catch(() => undefined);
  };

  const handleUnlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lockPassword === "111222333") {
      setLocked(false);
      setLockPassword("");
      setLockError("");
      return;
    }

    setLockError("Mật khẩu không đúng.");
  };

  return (
    <div className={`${styles.shell} ${isSidebarCollapsed ? styles.shellCollapsed : ""}`}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.logoBox} aria-label="Về bảng điều khiển admin">
          <Image
            src={sidebarLogo}
            alt="Vitamind"
            width={isSidebarCollapsed ? 34 : 168}
            height={isSidebarCollapsed ? 34 : 31}
            className={isSidebarCollapsed ? styles.logoShort : styles.logoWide}
          />
        </Link>

        <div className={styles.sidebarScroll}>
          {adminMenu.map((section) => (
            <div key={section.title}>
              <span className={styles.navGroupTitle}>{section.title}</span>
              <div className={styles.nav}>
                {section.items.map((item) => (
                  <Link
                    key={`${section.title}-${item.label}`}
                    href={item.href}
                    className={`${styles.navItem} ${item.key === activeItem ? styles.navItemActive : ""}`}
                    title={item.label}
                  >
                    <span className={styles.navIcon}>
                      <i className={item.icon} aria-hidden="true" />
                    </span>
                    <span className={styles.navText}>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className={styles.viewport}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.topbarButton}
              onClick={() => setSidebarCollapsed((value) => !value)}
              aria-label={isSidebarCollapsed ? "Mở sidebar admin" : "Thu gọn sidebar admin"}
              title={isSidebarCollapsed ? "Mở sidebar" : "Thu gọn sidebar"}
            >
              <i className="ri-menu-2-line" aria-hidden="true" />
            </button>
          </div>

          <form className={styles.topbarSearch} onSubmit={handleSearchSubmit}>
            <i className="ri-search-line" aria-hidden="true" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search..."
              aria-label="Tìm nhanh khu vực quản trị"
            />
          </form>

          <div className={styles.topbarRight} ref={controlsRef}>
            <button
              type="button"
              className={styles.topbarButton}
              onClick={toggleTheme}
              aria-label="Đổi giao diện sáng tối"
              title={`Đang ở chế độ ${resolvedTheme === "night" ? "tối" : "sáng"}`}
            >
              <i className={resolvedTheme === "night" ? "ri-sun-line" : "ri-moon-line"} aria-hidden="true" />
            </button>

            <button
              type="button"
              className={`${styles.topbarButton} ${styles.topbarButtonDesktop}`}
              onClick={toggleFullscreen}
              aria-label="Bật hoặc tắt toàn màn hình"
              title="Toàn màn hình"
            >
              <i className="ri-fullscreen-line" aria-hidden="true" />
            </button>

            <div className={styles.dropdownWrap}>
              <button
                type="button"
                className={styles.topbarButton}
                onClick={() => setNotificationsOpen((value) => !value)}
                aria-expanded={isNotificationsOpen}
                aria-label="Mở thông báo nhanh"
                title="Thông báo nhanh"
              >
                <i className="ri-notification-3-line" aria-hidden="true" />
                <span className={styles.badge}>3</span>
              </button>

              {isNotificationsOpen ? (
                <div className={styles.dropdownPanel}>
                  <div className={styles.dropdownHead}>
                    <strong>Quick Actions</strong>
                    <span>3 mục</span>
                  </div>
                  <div className={styles.dropdownList}>
                    {notificationLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={styles.dropdownItem}
                        onClick={() => setNotificationsOpen(false)}
                      >
                        <strong>{item.label}</strong>
                        <span>{item.note}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <AdminUserMenu onLock={() => setLocked(true)} />
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>

      {isLocked ? (
        <div className={styles.lockScreen} role="dialog" aria-modal="true" aria-label="Khoá màn hình quản trị">
          <div className={styles.lockCard}>
            <div className={styles.lockBrand}>
              <Image
                src={adminLogo}
                alt="Vitamind"
                width={168}
                height={31}
                className={styles.lockBrandLogo}
              />
            </div>

            <div className={styles.lockAvatarWrap}>
              {lockAvatar ? (
                <img src={lockAvatar} alt={lockName} className={styles.lockAvatar} />
              ) : (
                <span className={styles.lockAvatarFallback}>{lockName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className={styles.lockCopy}>
              <h2>Xin chào {lockName}!</h2>
              <p>Nhập mật khẩu để tiếp tục vào khu quản trị.</p>
            </div>

            <form className={styles.lockForm} onSubmit={handleUnlock}>
              <input
                ref={lockInputRef}
                type="password"
                value={lockPassword}
                onChange={(event) => {
                  setLockPassword(event.target.value);
                  setLockError("");
                }}
                placeholder="Nhập mật khẩu"
                aria-label="Nhập mật khẩu mở khoá"
              />
              {lockError ? <div className={styles.lockError}>{lockError}</div> : null}
              <button type="submit">Mở khoá</button>
            </form>

            <div className={styles.lockFooter}>
              <span>Không phải bạn? Quay lại</span>
              <button
                type="button"
                onClick={() => signOut({ redirectUrl: "/sign-in" })}
              >
                đăng nhập
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
