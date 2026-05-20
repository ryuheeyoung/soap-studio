import type { HTMLAttributes } from "react";

/**
 * @component
 * @description 카드/패널 래퍼 컴포넌트
 * @param {"default" | "row"} props.variant - row는 재료 행 등 컴팩트 카드용
 * @param {string} props.borderColor - 조건부 border 색상 override (예: "border-red-200 dark:border-red-900")
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "row";
  borderColor?: string;
}

export function Card({ variant = "default", borderColor, className = "", ...props }: CardProps) {
  const base =
    variant === "row"
      ? "flex flex-col gap-2 rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50"
      : "rounded-xl border bg-white dark:bg-zinc-900";

  const border = borderColor ?? "border-zinc-200 dark:border-zinc-800";

  return (
    <div
      className={`${base} ${variant === "default" ? border : ""} ${className}`}
      {...props}
    />
  );
}
