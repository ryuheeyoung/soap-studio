import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

/**
 * @component
 * @description 테이블 래퍼 — border·rounded 스타일 포함
 */
export function TableWrapper({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
      {...props}
    />
  );
}

/**
 * @component
 * @description 기본 table 태그 래퍼
 */
export function Table({ className = "", ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={`w-full text-sm ${className}`}
      {...props}
    />
  );
}

/**
 * @component
 * @description 테이블 헤더 셀. align prop으로 정렬 방향 지정
 * @param {"left" | "right"} props.align - 텍스트 정렬
 */
export interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "right";
}

export function Th({ align = "left", className = "", ...props }: ThProps) {
  return (
    <th
      className={`px-4 py-3 font-medium text-zinc-500 ${align === "right" ? "text-right" : "text-left"} ${className}`}
      {...props}
    />
  );
}

/**
 * @component
 * @description 테이블 데이터 셀. align prop으로 정렬 방향 지정
 * @param {"left" | "right"} props.align - 텍스트 정렬
 */
export interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "right";
}

export function Td({ align = "left", className = "", ...props }: TdProps) {
  return (
    <td
      className={`px-4 py-3 ${align === "right" ? "text-right tabular-nums" : ""} ${className}`}
      {...props}
    />
  );
}
