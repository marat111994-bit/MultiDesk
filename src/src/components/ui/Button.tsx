import Link from "next/link";
import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

type ButtonWithHref = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    type?: never;
    onClick?: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"];
  };

type ButtonWithoutHref = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
    type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
    onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  };

export type ButtonProps = ButtonWithHref | ButtonWithoutHref;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700",
  secondary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700",
  outline:
    "border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100",
  ghost:
    "bg-transparent text-primary-500 hover:bg-primary-50 active:bg-primary-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  children,
  href,
  ...props
}: ButtonProps) {
  const baseStyles = `inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;
  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
