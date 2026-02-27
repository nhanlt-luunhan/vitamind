"use client";

import * as React from "react";

export type CodeBlockProps = {
  code?: string;
  language?: string;
  label?: string;
  wrap?: boolean;
  className?: string;
};

const containerStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-3)",
  padding: "var(--space-4)",
  borderRadius: "var(--radius-3)",
  background: "var(--c-1)",
  color: "var(--c-6)",
  border: "1px solid var(--c-4)",
  boxShadow: "var(--shadow-2)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-3)",
};

const labelStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0 var(--space-3)",
  height: "28px",
  borderRadius: "var(--radius-pill)",
  background: "var(--c-0)",
  color: "var(--c-6)",
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const copyButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "0 var(--space-3)",
  height: "30px",
  borderRadius: "var(--radius-pill)",
  background: "transparent",
  color: "var(--c-6)",
  border: "1px solid var(--c-4)",
  fontSize: "0.8125rem",
  fontWeight: 600,
  cursor: "pointer",
};

const preStyle: React.CSSProperties = {
  margin: 0,
  padding: "var(--space-4)",
  borderRadius: "var(--radius-2)",
  background: "var(--c-0)",
  overflowX: "auto",
  fontSize: "0.9rem",
  lineHeight: 1.6,
};

function getCodeText(code: string | undefined, children: React.ReactNode) {
  if (code !== undefined) {
    return code;
  }
  if (typeof children === "string") {
    return children;
  }
  return "";
}

async function copyToClipboard(value: string) {
  if (!value) return;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CodeBlock({
  code,
  language,
  label,
  wrap = false,
  className,
  children,
}: React.PropsWithChildren<CodeBlockProps>) {
  const [copied, setCopied] = React.useState(false);
  const value = getCodeText(code, children);
  const heading = label ?? language ?? "code";

  const handleCopy = React.useCallback(async () => {
    await copyToClipboard(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [value]);

  return (
    <div className={className} style={containerStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>{heading}</span>
        <button type="button" style={copyButtonStyle} onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ ...preStyle, whiteSpace: wrap ? "pre-wrap" : "pre" }}>
        <code>{value}</code>
      </pre>
    </div>
  );
}
