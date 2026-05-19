"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Mold } from "@soap-studio/types";
import { deleteMoldAction } from "@/lib/actions/molds";

// 형태 레이블
const SHAPE_LABELS: Record<Mold["shape"], string> = {
  rectangle: "직사각형",
  circle: "원형",
  other: "기타",
};

const SHAPE_OPTIONS = (Object.entries(SHAPE_LABELS) as [Mold["shape"], string][]).map(
  ([value, label]) => ({ value, label })
);

interface Props {
  molds: Mold[];
}

/**
 * @component
 * @description 몰드 목록 테이블. 이름 검색 + 형태 칩 필터 포함
 * @param {Mold[]} props.molds - 전체 몰드 목록
 */
export default function MoldsTable({ molds }: Props) {
  // 이름 검색어
  const [query, setQuery] = useState("");
  // 선택된 형태 (null = 전체)
  const [shape, setShape] = useState<Mold["shape"] | null>(null);

  const filtered = molds.filter((mold) => {
    const matchName = mold.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchShape = shape === null || mold.shape === shape;
    return matchName && matchShape;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* 검색 + 필터 */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="몰드 이름 검색"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
          />
        </div>

        {/* 형태 칩 */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
          <button
            onClick={() => setShape(null)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
              shape === null
                ? "border-zinc-800 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            전체
          </button>
          {SHAPE_OPTIONS.filter((opt) => molds.some((m) => m.shape === opt.value)).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setShape(opt.value)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
                shape === opt.value
                  ? "border-zinc-800 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      {filtered.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-400">검색 결과가 없어요.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">몰드명</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">형태</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">칸당 용량</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">칸 수</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">총 용량</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((mold) => (
                <tr key={mold.id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{mold.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{SHAPE_LABELS[mold.shape]}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">{mold.weightPerCell}g</td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">{mold.cellCount}칸</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-zinc-900 dark:text-zinc-50">{mold.totalCapacity.toLocaleString()}g</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/molds/${mold.id}`}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        수정
                      </Link>
                      <form action={async () => { "use server"; await deleteMoldAction(mold.id); }}>
                        <button type="submit" className="rounded-md px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950">
                          삭제
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
