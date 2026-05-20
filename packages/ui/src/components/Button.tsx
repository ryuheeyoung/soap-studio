import type { ButtonHTMLAttributes } from "react";

/**
 * @component
 * @description 공통 버튼 컴포넌트. variant로 스타일 분기
 * @param {"primary" | "secondary" | "text"} props.variant - 버튼 스타일 종류
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "text";
}

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
  secondary:
    "flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900",
  text: "flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`${variantClass[variant]} ${className}`}
      {...props}
    />
  );
}
