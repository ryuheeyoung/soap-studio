import type { TextareaHTMLAttributes } from "react";

/**
 * @component
 * @description 공통 textarea 컴포넌트
 * @param {"default" | "mono"} props.variant - mono는 JSON 등 코드성 입력용
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "mono";
}

const variantClass: Record<NonNullable<TextareaProps["variant"]>, string> = {
  default:
    "resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700",
  mono: "resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-xs text-zinc-800 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:ring-zinc-800",
};

export function Textarea({ variant = "default", className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`${variantClass[variant]} ${className}`}
      {...props}
    />
  );
}
