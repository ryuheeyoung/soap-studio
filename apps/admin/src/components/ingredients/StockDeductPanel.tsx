"use client";

import { useState, useTransition } from "react";
import { ClipboardPaste, Check, AlertCircle, AlertTriangle } from "lucide-react";
import { batchDeductStockAction } from "@/lib/actions/ingredients";
import type { Ingredient } from "@soap-studio/types";
import { Button, FormLabel, Textarea, AlertPanel, TableWrapper, Table, Th, Td } from "@soap-studio/ui";

// 소요량 JSON 항목 타입 (SessionPanel 소요량 복사 형식)
interface DeductItem {
  ingredientId: string;
  name: string;
  unit: string;
  deduct: number;
}

// 프리뷰 행 — 현재 재고 + 차감량 + 적용 후 재고
interface PreviewRow extends DeductItem {
  currentStock: number;
  afterStock: number;
  found: boolean;
  // 차감 후 재고가 음수가 되는 케이스 (0으로 고정 처리)
  isInsufficient: boolean;
}

interface Props {
  ingredients: Ingredient[];
}

/**
 * @component
 * @description 소요량 JSON 붙여넣기 → 재고 차감 미리보기 → 일괄 적용 패널
 * @param {Ingredient[]} props.ingredients - 현재 재고 조회용 전체 재료 목록
 */
export default function StockDeductPanel({ ingredients }: Props) {
  // 붙여넣은 JSON 원문
  const [raw, setRaw] = useState("");
  // 파싱된 미리보기 행 목록
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  // 파싱 오류 메시지
  const [parseError, setParseError] = useState<string | null>(null);
  // 적용 완료 여부
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

  function handleParse() {
    setDone(false);
    setParseError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      setParseError("JSON 형식이 올바르지 않아요. 계산기에서 소요량 복사한 값을 그대로 붙여넣어 주세요.");
      setPreview(null);
      return;
    }

    if (!Array.isArray(parsed)) {
      setParseError("배열 형식이어야 해요. [ ] 로 감싸진 JSON인지 확인해 주세요.");
      setPreview(null);
      return;
    }

    const rows: PreviewRow[] = (parsed as DeductItem[]).map((item) => {
      const ing = ingredientMap.get(item.ingredientId);
      const currentStock = ing?.stock ?? 0;
      const afterStock = currentStock - (item.deduct ?? 0);
      return {
        ...item,
        currentStock,
        afterStock: Math.max(0, afterStock),
        found: !!ing,
        isInsufficient: afterStock < 0,
      };
    });

    setPreview(rows);
  }

  function handleApply() {
    if (!preview) return;
    const items = preview
      .filter((r) => r.found && r.deduct > 0)
      .map((r) => ({ ingredientId: r.ingredientId, deduct: r.deduct }));

    startTransition(async () => {
      await batchDeductStockAction(items);
      setDone(true);
      setRaw("");
      setPreview(null);
    });
  }

  const hasInsufficient = preview?.some((r) => r.found && r.isInsufficient);

  return (
    <div className="flex flex-col gap-6">
      {/* JSON 입력 영역 */}
      <div className="flex flex-col gap-2">
        <FormLabel>소요량 JSON 붙여넣기</FormLabel>
        <Textarea
          variant="mono"
          value={raw}
          onChange={(e) => { setRaw(e.target.value); setPreview(null); setParseError(null); setDone(false); }}
          rows={6}
          placeholder={'[\n  { "ingredientId": "...", "name": "...", "unit": "g", "deduct": 150 }\n]'}
        />

        {parseError && (
          <AlertPanel variant="error" className="flex items-start gap-2 px-3 py-2.5">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-xs text-red-600 dark:text-red-400">{parseError}</p>
          </AlertPanel>
        )}

        <Button
          type="button"
          variant="secondary"
          onClick={handleParse}
          disabled={!raw.trim()}
          className="w-full"
        >
          <ClipboardPaste size={14} />
          미리보기
        </Button>
      </div>

      {/* 적용 완료 메시지 */}
      {done && (
        <AlertPanel variant="success" className="flex items-center gap-2">
          <Check size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">재고가 차감됐어요!</p>
        </AlertPanel>
      )}

      {/* 재고 부족 경고 */}
      {hasInsufficient && (
        <AlertPanel variant="warning" className="flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            재고가 부족한 재료가 있어요. 차감 후 0으로 고정됩니다.
          </p>
        </AlertPanel>
      )}

      {/* 미리보기 테이블 */}
      {preview && preview.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            변경 미리보기
            <span className="ml-1.5 font-normal text-zinc-400">{preview.length}개 재료</span>
          </h2>

          <TableWrapper>
            <Table>
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <Th>재료명</Th>
                  <Th align="right">현재 재고</Th>
                  <Th align="right">차감량</Th>
                  <Th align="right">적용 후</Th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row) => (
                  <tr
                    key={row.ingredientId}
                    className={`border-b border-zinc-50 last:border-0 dark:border-zinc-800 ${
                      !row.found ? "opacity-40" : ""
                    }`}
                  >
                    <Td>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">{row.name}</span>
                      {!row.found && (
                        <span className="ml-2 text-xs text-red-400">미등록 재료</span>
                      )}
                    </Td>
                    <Td align="right" className="text-zinc-500">
                      {row.currentStock.toLocaleString()} {row.unit}
                    </Td>
                    <Td align="right" className="font-medium text-red-500">
                      -{row.deduct.toLocaleString()} {row.unit}
                    </Td>
                    <Td
                      align="right"
                      className={`font-semibold ${
                        row.isInsufficient ? "text-amber-500" : "text-zinc-900 dark:text-zinc-50"
                      }`}
                    >
                      {row.afterStock.toLocaleString()} {row.unit}
                      {row.isInsufficient && (
                        <span className="ml-1 text-xs font-normal text-amber-400">(부족)</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>

          <Button
            type="button"
            onClick={handleApply}
            disabled={isPending || preview.every((r) => !r.found)}
            className="w-full"
          >
            {isPending ? "적용 중..." : "재고 일괄 차감"}
          </Button>
        </div>
      )}
    </div>
  );
}
