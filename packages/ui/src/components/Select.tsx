import type { SelectHTMLAttributes } from "react";

/**
 * @component
 * @description 공통 select 드롭다운 컴포넌트
 * @param {"default" | "sm"} props.variant - 크기 변형
 */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "sm";
}

const variantClass: Record<NonNullable<SelectProps["variant"]>, string> = {
  default:
    "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700",
  sm: "rounded-md border border-zinc-200 bg-white px-1.5 py-1.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900",
};

export function Select({ variant = "default", className = "", ...props }: SelectProps) {
  return (
    <select
      className={`${variantClass[variant]} ${className}`}
      {...props}
    />
  );
}
