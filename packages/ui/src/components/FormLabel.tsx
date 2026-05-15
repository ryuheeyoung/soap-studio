import type { LabelHTMLAttributes } from "react";

/**
 * @component
 * @description 폼 필드 레이블 컴포넌트
 * @param {"default" | "sm"} props.variant - sm은 작은 인라인 레이블용
 */
export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  variant?: "default" | "sm";
}

const variantClass: Record<NonNullable<FormLabelProps["variant"]>, string> = {
  default: "text-sm font-medium text-zinc-700 dark:text-zinc-300",
  sm: "block text-xs font-medium text-zinc-500 mb-1",
};

export function FormLabel({ variant = "default", className = "", ...props }: FormLabelProps) {
  return (
    <label
      className={`${variantClass[variant]} ${className}`}
      {...props}
    />
  );
}
