import * as React from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-4)",
  padding: "var(--space-5)",
  borderRadius: "var(--radius-3)",
  background: "var(--c-6)",
  border: "1px solid var(--c-4)",
  boxShadow: "var(--shadow-1)",
};

const sectionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-3)",
};

export function Card({ header, footer, className, style, children, ...props }: CardProps) {
  const mergedStyle: React.CSSProperties = {
    ...cardStyle,
    ...style,
  };

  return (
    <section className={className} style={mergedStyle} {...props}>
      {header ? <div style={sectionStyle}>{header}</div> : null}
      <div>{children}</div>
      {footer ? <div style={sectionStyle}>{footer}</div> : null}
    </section>
  );
}
