import type { HTMLAttributes } from "react";

/**
 * @component
 * @description 인라인 배지 컴포넌트. 카테고리·공정타입 등 상태 표시용
 * @param {"default" | "mp" | "cp" | "hp"} props.variant - 배지 색상 종류
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "mp" | "cp" | "hp";
}

const variantClass: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:
    "rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
  mp: "rounded px-1.5 py-0.5 text-xs font-semibold bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  cp: "rounded px-1.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  hp: "rounded px-1.5 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
};

export function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`${variantClass[variant]} ${className}`}
      {...props}
    />
  );
}
