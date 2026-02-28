import Link from "next/link";

type StudioAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type StudioStat = {
  label: string;
  value: string;
  note: string;
};

type StudioNavItem = {
  href: string;
  label: string;
  meta: string;
};

type StudioShellProps = {
  badge: string;
  title: string;
  description: string;
  actions?: StudioAction[];
  stats?: StudioStat[];
  navItems?: StudioNavItem[];
  activeHref?: string;
  children: React.ReactNode;
};

export function StudioShell({
  badge,
  title,
  description,
  actions = [],
  stats = [],
  navItems = [],
  activeHref,
  children,
}: StudioShellProps) {
  return (
    <div className="studio-layout">
      <aside className="studio-sidebar">
        <div className="studio-sidebar__card">
          <span className="studio-sidebar__badge">{badge}</span>
          <h2 className="studio-sidebar__title">{title}</h2>
          <p className="studio-sidebar__description">{description}</p>
        </div>

        {navItems.length ? (
          <nav className="studio-sidebar__card studio-sidebar__nav">
            <span className="studio-sidebar__eyebrow">Điều hướng</span>
            <div className="studio-nav">
              {navItems.map((item) => {
                const isActive = item.href === activeHref;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`studio-nav__item ${isActive ? "is-active" : ""}`}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.meta}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        ) : null}

        {actions.length ? (
          <div className="studio-sidebar__card">
            <span className="studio-sidebar__eyebrow">Hành động</span>
            <div className="studio-sidebar__actions">
              {actions.map((action) => (
                <Link
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  className={`studio-action studio-action--${action.variant ?? "secondary"}`}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </aside>

      <div className="studio-shell">
        {stats.length ? (
          <section className="studio-hero">
            <div className="studio-hero__copy">
              <span className="studio-hero__badge">{badge}</span>
              <h1 className="studio-hero__title">{title}</h1>
              <p className="studio-hero__description">{description}</p>
            </div>

            <div className="studio-metrics">
              {stats.map((stat) => (
                <article key={stat.label} className="studio-metric">
                  <span className="studio-metric__label">{stat.label}</span>
                  <strong className="studio-metric__value">{stat.value}</strong>
                  <p className="studio-metric__note">{stat.note}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="studio-content">{children}</section>
      </div>
    </div>
  );
}
