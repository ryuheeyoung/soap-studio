import type { HTMLAttributes } from "react";

/**
 * @component
 * @description 상태 알림 패널. 성공·오류·경고 세 가지 색상 변형 제공
 * @param {"success" | "error" | "warning"} props.variant - 알림 종류
 */
export interface AlertPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant: "success" | "error" | "warning";
}

const variantClass: Record<AlertPanelProps["variant"], string> = {
  success:
    "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950",
  error:
    "rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950",
  warning:
    "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950",
};

export function AlertPanel({ variant, className = "", ...props }: AlertPanelProps) {
  return (
    <div
      className={`${variantClass[variant]} ${className}`}
      {...props}
    />
  );
}
