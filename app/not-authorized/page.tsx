import Link from "next/link";

export default function Page() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "24px",
        textAlign: "center",
        background: "var(--page-bg)",
      }}
    >
      {/* Icon khóa */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.45, marginBottom: "4px" }}
      >
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7 11V7a5 5 0 0 1 10 0v4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      </svg>

      <h1
        style={{
          margin: 0,
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--page-text)",
          letterSpacing: "-0.01em",
        }}
      >
        Không có quyền truy cập
      </h1>

      <p
        style={{
          margin: 0,
          fontSize: "0.95rem",
          color: "var(--page-text-muted, rgba(148,163,184,0.8))",
          maxWidth: "320px",
          lineHeight: 1.6,
        }}
      >
        Tài khoản của bạn chưa đủ quyền hoặc đang bị khóa.
      </p>

      <Link
        href="/"
        style={{
          marginTop: "8px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "9px 20px",
          borderRadius: "10px",
          background: "rgba(56,189,248,0.1)",
          border: "1px solid rgba(56,189,248,0.2)",
          color: "#38bdf8",
          fontSize: "0.88rem",
          fontWeight: 600,
          textDecoration: "none",
          transition: "background 0.18s ease",
        }}
      >
        ← Về trang chủ
      </Link>
    </div>
  );
}
