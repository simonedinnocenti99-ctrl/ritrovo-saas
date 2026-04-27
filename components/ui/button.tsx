import Link from "next/link";
import { cn } from "@/lib/utils";
import { cloneElement, isValidElement } from "react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
  href?: string;
  children: ReactNode;
};

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border bg-white/70 text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10"
};

export function Button({ className, variant = "default", size = "md", asChild, href, children, ...props }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if (asChild && href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  if (asChild && isValidElement<{ className?: string }>(children)) {
    return cloneElement(children, {
      className: cn(classes, children.props.className)
    });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export type AnchorButtonProps = AnchorHTMLAttributes<HTMLAnchorElement>;
