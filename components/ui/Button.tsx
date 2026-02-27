import * as React from "react";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  asChild?: boolean;
  unstyled?: boolean;
};

const baseStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-2)",
  fontWeight: 600,
  borderRadius: "var(--radius-3)",
  transition: "transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease",
  border: "1px solid transparent",
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: "var(--space-2) var(--space-4)",
    fontSize: "0.875rem",
    lineHeight: "1.1",
  },
  md: {
    padding: "var(--space-3) var(--space-5)",
    fontSize: "1rem",
    lineHeight: "1.2",
  },
  lg: {
    padding: "var(--space-4) var(--space-6)",
    fontSize: "1.125rem",
    lineHeight: "1.2",
  },
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--g-brand)",
    color: "var(--c-6)",
    boxShadow: "var(--shadow-1)",
  },
  outline: {
    background: "transparent",
    color: "var(--c-0)",
    border: "1px solid var(--c-2)",
  },
  ghost: {
    background: "transparent",
    color: "var(--c-0)",
  },
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  asChild = false,
  unstyled = false,
  className,
  style,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const mergedStyle: React.CSSProperties = unstyled
    ? { ...style }
    : {
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
        width: fullWidth ? "100%" : undefined,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        ...style,
      };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      className?: string;
      style?: React.CSSProperties;
      onClick?: React.MouseEventHandler;
      "aria-disabled"?: boolean;
    }>;
    const childClassName = [child.props.className, className].filter(Boolean).join(" ");
    const childStyle = { ...child.props.style, ...mergedStyle };
    const childProps = {
      className: childClassName || undefined,
      style: childStyle,
      "aria-disabled": disabled ? true : undefined,
      onClick: disabled
        ? (event: React.MouseEvent) => {
            event.preventDefault();
          }
        : child.props.onClick,
    };
    return React.cloneElement(child, childProps);
  }

  return (
    <button type="button" className={className} style={mergedStyle} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
