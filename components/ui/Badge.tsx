import * as React from "react";

type BadgeVariant = "solid" | "outline" | "subtle";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  unstyled?: boolean;
};

const baseStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  padding: "0 var(--space-3)",
  height: "28px",
  borderRadius: "var(--radius-pill)",
  fontSize: "0.8125rem",
  fontWeight: 600,
  letterSpacing: "0.01em",
  border: "1px solid transparent",
};

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  solid: {
    background: "var(--c-1)",
    color: "var(--c-6)",
  },
  outline: {
    background: "transparent",
    color: "var(--c-0)",
    border: "1px solid var(--c-2)",
  },
  subtle: {
    background: "var(--c-5)",
    color: "var(--c-0)",
  },
};

export function Badge({
  variant = "subtle",
  unstyled = false,
  className,
  style,
  ...props
}: BadgeProps) {
  const mergedStyle: React.CSSProperties = unstyled
    ? { ...style }
    : {
        ...baseStyle,
        ...variantStyles[variant],
        ...style,
      };

  return <span className={className} style={mergedStyle} {...props} />;
}
