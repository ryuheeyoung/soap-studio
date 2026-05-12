"use client";

import { useSessionStore } from "@/stores/session";
import { calcTotalBatchSize, recommendMolds } from "@/lib/calculate";
import type { Mold } from "@soap-studio/types";

interface Props {
  molds: Mold[];
}

/**
 * @component
 * @description 총 배치 용량 기준 몰드 적합도 추천 패널. 상위 5개 몰드를 잔량 기준으로 표시
 * @param {Mold[]} props.molds - 전체 몰드 목록
 */
export default function MoldPanel({ molds }: Props) {
  const { items } = useSessionStore();

  if (items.length === 0) return null;

  const totalBatchSize = calcTotalBatchSize(items);
  const recommendations = recommendMolds(totalBatchSize, molds).slice(0, 5);

  if (recommendations.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">몰드 추천</h2>
        <span className="text-xs text-zinc-400">총 {Math.round(totalBatchSize)}g 기준</span>
      </div>

      <ul className="flex flex-col gap-2">
        {recommendations.map(({ mold, fillRatio, remainder }) => {
          // fillRatio: 몰드용량/배치용량 — 1.0이 딱 맞음
          const pct = Math.round(fillRatio * 100);
          const isOver = remainder < 0; // 배치가 몰드보다 큼
          const isFit = Math.abs(remainder) <= 20; // ±20g 허용 범위

          return (
            <li
              key={mold.id}
              className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {mold.name}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    isFit
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isOver
                      ? "text-red-500"
                      : "text-zinc-500"
                  }`}
                >
                  {isFit ? "딱 맞음" : isOver ? `${Math.abs(remainder).toFixed(0)}g 초과` : `${remainder.toFixed(0)}g 남음`}
                </span>
              </div>

              {/* 채움 비율 바 */}
              <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    isFit
                      ? "bg-emerald-500"
                      : isOver
                      ? "bg-red-400"
                      : "bg-zinc-400"
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  {mold.cellCount}칸 × {mold.weightPerCell}g = {mold.totalCapacity}g
                </span>
                <span className="tabular-nums">{pct}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
