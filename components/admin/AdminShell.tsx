import Link from "next/link";
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

export function AdminShell({ activeItem, children }: AdminShellProps) {
  const adminMenu = [
    {
      title: "Tổng quan",
      items: [
        { href: "/admin", label: "Bảng điều khiển", icon: "DG", key: "dashboard" as const },
        { href: "/account", label: "Tài khoản", icon: "TK", key: "account" as const },
        { href: "/admin/database", label: "Cơ sở dữ liệu", icon: "DB", key: "database" as const },
      ],
    },
    {
      title: "Vận hành",
      items: [
        { href: "/admin?tab=users", label: "Người dùng", icon: "ND", key: "users" as const },
        { href: "/admin?tab=products", label: "Sản phẩm", icon: "SP", key: "products" as const },
        { href: "/admin?tab=orders", label: "Đơn hàng", icon: "DH", key: "orders" as const },
        { href: "/admin?tab=blog", label: "Blog", icon: "BV", key: "blog" as const },
        { href: "/admin?tab=media", label: "Thư viện", icon: "TV", key: "media" as const },
        { href: "/admin?tab=audit", label: "Nhật ký", icon: "NK", key: "audit" as const },
      ],
    },
    {
      title: "Hệ thống",
      items: [{ href: "/", label: "Trang chủ", icon: "TC", key: null }],
    },
  ];

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>VD</span>
          <div className={styles.brandMeta}>
            <strong>Vitamind</strong>
            <span>Quản trị hệ thống</span>
          </div>
        </div>

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
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navText}>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
