"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Recipe, Ingredient, ProcessType, Difficulty, IngredientCategory } from "@soap-studio/types";
import type { RecipeIngredientInput, RecipeSubstituteInput } from "@soap-studio/db/queries/recipes";

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Recipe;
  allIngredients: Ingredient[];
  submitLabel?: string;
}

// 재료 행 상태
interface IngredientRow {
  ingredientId: string;
  // 드롭다운 미선택 시 신규 등록할 재료명
  newIngredientName: string;
  groupLabel: string;
  amount: string;
  // 선택/신규 재료의 단위 (g / ml / ea)
  unit: string;
}

// 대체재료 행 상태
interface SubstituteRow {
  originalIngredientId: string;
  substituteIngredientId: string;
  // 신규 등록할 대체 재료명 (substituteIngredientId가 없을 때 사용)
  newSubIngredientName: string;
  newSubIngredientUnit: string;
  memo: string;
}

const PROCESS_TYPE_LABELS: Record<ProcessType, string> = {
  mp: "MP — 녹여붓기",
  cp: "CP — 콜드프로세스",
  hp: "HP — 핫프로세스",
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  low: "쉬움",
  medium: "보통",
  high: "어려움",
};

// 재료 카테고리 → 레시피 내 그룹 레이블 매핑
const CATEGORY_GROUP_LABELS: Record<IngredientCategory, string> = {
  soap_base: "비누베이스",
  oil: "오일류",
  butter: "버터류",
  lye: "가성소다/가성가리",
  water: "수분류",
  surfactant: "계면활성제",
  emulsifier: "유화제",
  powder: "분말류",
  additive: "첨가물",
  essential_oil: "에센셜오일",
  colorant: "색소",
  other: "기타",
};

/**
 * @component
 * @description 레시피 생성/수정 폼. 재료 동적 추가/삭제 및 재료 검색 포함
 * @param {(formData: FormData) => Promise<void>} props.action - 폼 제출 서버 액션
 * @param {Recipe} props.defaultValues - 수정 시 기본값
 * @param {Ingredient[]} props.allIngredients - 재료 검색용 전체 재료 목록
 * @param {string} props.submitLabel - 제출 버튼 레이블
 */
export default function RecipeForm({ action, defaultValues, allIngredients, submitLabel = "저장하기" }: Props) {
  // 재료 행 초기값 세팅
  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>(() => {
    if (!defaultValues?.ingredients.length) return [];
    return defaultValues.ingredients.map((ing) => {
      const found = allIngredients.find((i) => i.id === ing.ingredientId);
      // 재료 category에서 그룹 레이블 파생 (DB에 저장하지 않음)
      const groupLabel = found ? CATEGORY_GROUP_LABELS[found.category] : "";
      return {
        ingredientId: ing.ingredientId,
        newIngredientName: "",
        groupLabel,
        amount: ing.fixedAmount != null ? String(ing.fixedAmount) : "",
        unit: found?.unit ?? "",
      };
    });
  });

  // 대체재료 행 초기값
  const [substituteRows, setSubstituteRows] = useState<SubstituteRow[]>(() => {
    if (!defaultValues?.substitutes?.length) return [];
    return defaultValues.substitutes.map((sub) => ({
      originalIngredientId: sub.originalIngredientId,
      substituteIngredientId: sub.substituteIngredientId,
      newSubIngredientName: "",
      newSubIngredientUnit: "",
      memo: sub.memo ?? "",
    }));
  });

  // 재료 검색어
  const [ingSearches, setIngSearches] = useState<string[]>(() => {
    if (!defaultValues?.ingredients.length) return [];
    return defaultValues.ingredients.map((ing) => {
      const found = allIngredients.find((i) => i.id === ing.ingredientId);
      return found?.name ?? "";
    });
  });

  // 대체재료 검색어
  const [origSearches, setOrigSearches] = useState<string[]>(() =>
    defaultValues?.substitutes?.map((sub) => {
      const found = allIngredients.find((i) => i.id === sub.originalIngredientId);
      return found?.name ?? "";
    }) ?? []
  );
  const [subSearches, setSubSearches] = useState<string[]>(() =>
    defaultValues?.substitutes?.map((sub) => {
      const found = allIngredients.find((i) => i.id === sub.substituteIngredientId);
      return found?.name ?? "";
    }) ?? []
  );

  // 대체재료 섹션 펼치기 토글
  const [showSubstitutes, setShowSubstitutes] = useState(
    (defaultValues?.substitutes?.length ?? 0) > 0
  );

  const formRef = useRef<HTMLFormElement>(null);

  // ─── 재료 조작 ────────────────────────────────────────────────────────────

  function addIngredientRow() {
    setIngredientRows((prev) => [...prev, {
      ingredientId: "", newIngredientName: "", groupLabel: "", amount: "", unit: "",
    }]);
    setIngSearches((prev) => [...prev, ""]);
  }

  function removeIngredientRow(idx: number) {
    setIngredientRows((prev) => prev.filter((_, i) => i !== idx));
    setIngSearches((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateIngredientRow(idx: number, patch: Partial<IngredientRow>) {
    setIngredientRows((prev) => prev.map((row, i) => i === idx ? { ...row, ...patch } : row));
  }

  // ─── 대체재료 조작 ────────────────────────────────────────────────────────

  function addSubstituteRow() {
    setSubstituteRows((prev) => [...prev, { originalIngredientId: "", substituteIngredientId: "", newSubIngredientName: "", newSubIngredientUnit: "", memo: "" }]);
    setOrigSearches((prev) => [...prev, ""]);
    setSubSearches((prev) => [...prev, ""]);
  }

  function removeSubstituteRow(idx: number) {
    setSubstituteRows((prev) => prev.filter((_, i) => i !== idx));
    setOrigSearches((prev) => prev.filter((_, i) => i !== idx));
    setSubSearches((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateSubstituteRow(idx: number, patch: Partial<SubstituteRow>) {
    setSubstituteRows((prev) => prev.map((row, i) => i === idx ? { ...row, ...patch } : row));
  }

  // ─── 제출 핸들러 ──────────────────────────────────────────────────────────

  async function handleSubmit(formData: FormData) {
    // 기존 재료(ingredientId 있음) + 신규 재료(newIngredientName 있음) 통합 직렬화
    // 서버 액션에서 신규 재료를 먼저 생성 후 ID를 확보함
    const ingredients = ingredientRows
      .filter((row) => row.ingredientId || row.newIngredientName)
      .map((row) => ({
        ingredientId: row.ingredientId || undefined,
        newIngredientName: row.newIngredientName || undefined,
        newIngredientUnit: row.newIngredientName ? (row.unit || "g") : undefined,
        fixedAmount: row.amount ? Number(row.amount) : undefined,
        isOptional: false,
      }));

    const substitutes = substituteRows
      .filter((row) => row.originalIngredientId && (row.substituteIngredientId || row.newSubIngredientName))
      .map((row) => ({
        originalIngredientId: row.originalIngredientId,
        substituteIngredientId: row.substituteIngredientId || undefined,
        newSubIngredientName: row.newSubIngredientName || undefined,
        newSubIngredientUnit: row.newSubIngredientName ? (row.newSubIngredientUnit || "g") : undefined,
        memo: row.memo || undefined,
      }));

    formData.set("ingredients", JSON.stringify(ingredients));
    formData.set("substitutes", JSON.stringify(substitutes));
    await action(formData);
  }

  // ─── 재료 자동완성 필터 ───────────────────────────────────────────────────

  function filterIngredients(search: string): Ingredient[] {
    if (!search.trim()) return allIngredients.slice(0, 8);
    const lower = search.toLowerCase();
    return allIngredients.filter((i) => i.name.toLowerCase().includes(lower)).slice(0, 8);
  }

  // ─── 공통 스타일 ──────────────────────────────────────────────────────────

  const inputCls = "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500";
  const labelCls = "block text-xs font-medium text-zinc-500 mb-1";

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-6">
      {/* ── 기본 정보 ── */}
      <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">기본 정보</h2>

        <div className="grid grid-cols-2 gap-3">
          {/* 레시피명 */}
          <div className="col-span-2">
            <label className={labelCls}>레시피명 *</label>
            <input
              name="name"
              required
              defaultValue={defaultValues?.name}
              className={inputCls}
              placeholder="예: 병풀 더블 약산성비누"
            />
          </div>

          {/* 캐치프레이즈 */}
          <div className="col-span-2">
            <label className={labelCls}>캐치프레이즈</label>
            <input
              name="catchphrase"
              defaultValue={defaultValues?.catchphrase}
              className={inputCls}
              placeholder="예: 뾰드득 금지, 수분남기는 세안 ~"
            />
          </div>

          {/* 제조 방식 */}
          <div>
            <label className={labelCls}>제조 방식 *</label>
            <select name="processType" required defaultValue={defaultValues?.processType ?? "mp"} className={inputCls}>
              {(Object.entries(PROCESS_TYPE_LABELS) as [ProcessType, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* 제품 유형 */}
          <div>
            <label className={labelCls}>제품 유형 *</label>
            <input
              name="productType"
              required
              defaultValue={defaultValues?.productType}
              className={inputCls}
              placeholder="예: 비누, 샴푸바, 물비누"
            />
          </div>

          {/* 배치 크기 */}
          <div>
            <label className={labelCls}>배치 크기 (g) *</label>
            <input
              name="batchSize"
              type="number"
              required
              min={1}
              defaultValue={defaultValues?.batchSize}
              className={inputCls}
              placeholder="예: 540"
            />
          </div>

          {/* 난이도 */}
          <div>
            <label className={labelCls}>난이도</label>
            <select name="difficulty" defaultValue={defaultValues?.difficulty ?? ""} className={inputCls}>
              <option value="">선택 안 함</option>
              {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* 소요 시간 */}
          <div>
            <label className={labelCls}>소요 시간</label>
            <input
              name="timeRequired"
              defaultValue={defaultValues?.timeRequired}
              className={inputCls}
              placeholder="예: 1시간, 30분"
            />
          </div>

          {/* 보관 방법 */}
          <div>
            <label className={labelCls}>보관 방법</label>
            <input
              name="storageLocation"
              defaultValue={defaultValues?.storageLocation}
              className={inputCls}
              placeholder="예: 상온, 한 달"
            />
          </div>

          {/* 가열 필요 */}
          <div className="col-span-2 flex items-center gap-3">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">가열 필요</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-sm">
                <input type="radio" name="needsHeating" value="true" defaultChecked={defaultValues?.needsHeating === true} />
                예
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input type="radio" name="needsHeating" value="false" defaultChecked={defaultValues?.needsHeating !== true} />
                아니오
              </label>
            </div>
          </div>

          {/* 적합 피부 */}
          <div className="col-span-2">
            <label className={labelCls}>적합 피부 (쉼표 구분)</label>
            <input
              name="skinType"
              defaultValue={defaultValues?.skinType?.join(", ")}
              className={inputCls}
              placeholder="예: 모든 피부, 지성, 트러블"
            />
          </div>

          {/* 준비물 */}
          <div className="col-span-2">
            <label className={labelCls}>준비물 (줄바꿈 구분)</label>
            <textarea
              name="tools"
              rows={3}
              defaultValue={defaultValues?.tools?.join("\n")}
              className={`${inputCls} resize-none`}
              placeholder={"저울\n아로마베이스70\n비누칼"}
            />
          </div>

          {/* 메모 */}
          <div className="col-span-2">
            <label className={labelCls}>메모</label>
            <textarea
              name="memo"
              rows={2}
              defaultValue={defaultValues?.memo}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* ── 재료 목록 ── */}
      <section className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            재료 목록 <span className="ml-1 font-normal text-zinc-400">({ingredientRows.length}개)</span>
          </h2>
          <button
            type="button"
            onClick={addIngredientRow}
            className="flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <Plus size={12} />
            재료 추가
          </button>
        </div>

        {ingredientRows.length === 0 && (
          <p className="text-center text-xs text-zinc-400 py-4">재료를 추가해주세요.</p>
        )}

        {ingredientRows.map((row, idx) => (
          <IngredientRowItem
            key={idx}
            row={row}
            search={ingSearches[idx] ?? ""}
            suggestions={filterIngredients(ingSearches[idx] ?? "")}
            canAddNew={
              (ingSearches[idx]?.trim().length ?? 0) > 0 &&
              !allIngredients.some((i) => i.name === ingSearches[idx]?.trim())
            }
            onSearchChange={(val) => {
              setIngSearches((prev) => prev.map((s, i) => i === idx ? val : s));
              // 검색어 수정 시 이전 선택/신규 재료 초기화
              updateIngredientRow(idx, { ingredientId: "", newIngredientName: "", groupLabel: "", unit: "" });
            }}
            onSelectIngredient={(ing) => {
              updateIngredientRow(idx, {
                ingredientId: ing.id,
                groupLabel: CATEGORY_GROUP_LABELS[ing.category],
                unit: ing.unit,
              });
              setIngSearches((prev) => prev.map((s, i) => i === idx ? ing.name : s));
            }}
            onAddNew={(name) => {
              updateIngredientRow(idx, { newIngredientName: name, ingredientId: "", groupLabel: "", unit: "g" });
              setIngSearches((prev) => prev.map((s, i) => i === idx ? name : s));
            }}
            onChange={(patch) => updateIngredientRow(idx, patch)}
            onRemove={() => removeIngredientRow(idx)}
          />
        ))}
      </section>

      {/* ── 대체재료 ── */}
      <section className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setShowSubstitutes((v) => !v)}
          className="flex items-center justify-between w-full"
        >
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            대체재료 <span className="ml-1 font-normal text-zinc-400">({substituteRows.length}개)</span>
          </h2>
          {showSubstitutes ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
        </button>

        {showSubstitutes && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={addSubstituteRow}
              className="self-start flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <Plus size={12} />
              대체재료 추가
            </button>

            {substituteRows.map((row, idx) => {
              // 원본 재료 후보: 현재 레시피에 등록된 재료(ID 확정된 것)만
              const origCandidates = ingredientRows
                .filter((r) => r.ingredientId)
                .map((r) => allIngredients.find((i) => i.id === r.ingredientId))
                .filter((i): i is Ingredient => i !== undefined);

              const subSearch = subSearches[idx] ?? "";

              return (
                <SubstituteRowItem
                  key={idx}
                  row={row}
                  origSearch={origSearches[idx] ?? ""}
                  subSearch={subSearch}
                  origSuggestions={origCandidates}
                  subSuggestions={allIngredients}
                  canAddNewSub={
                    subSearch.trim().length > 0 &&
                    !allIngredients.some((i) => i.name === subSearch.trim())
                  }
                  onOrigSearchChange={(val) => {
                    setOrigSearches((prev) => prev.map((s, i) => i === idx ? val : s));
                    updateSubstituteRow(idx, { originalIngredientId: "" });
                  }}
                  onSubSearchChange={(val) => {
                    setSubSearches((prev) => prev.map((s, i) => i === idx ? val : s));
                    updateSubstituteRow(idx, { substituteIngredientId: "", newSubIngredientName: "", newSubIngredientUnit: "" });
                  }}
                  onSelectOrig={(ing) => {
                    updateSubstituteRow(idx, { originalIngredientId: ing.id });
                    setOrigSearches((prev) => prev.map((s, i) => i === idx ? ing.name : s));
                  }}
                  onSelectSub={(ing) => {
                    updateSubstituteRow(idx, { substituteIngredientId: ing.id, newSubIngredientName: "", newSubIngredientUnit: "" });
                    setSubSearches((prev) => prev.map((s, i) => i === idx ? ing.name : s));
                  }}
                  onAddNewSub={(name) => {
                    updateSubstituteRow(idx, { newSubIngredientName: name, newSubIngredientUnit: "g", substituteIngredientId: "" });
                    setSubSearches((prev) => prev.map((s, i) => i === idx ? name : s));
                  }}
                  onChange={(patch) => updateSubstituteRow(idx, patch)}
                  onRemove={() => removeSubstituteRow(idx)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* ── 제출 버튼 ── */}
      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {submitLabel}
      </button>
    </form>
  );
}

// ─── 재료 행 서브컴포넌트 ──────────────────────────────────────────────────────

interface IngredientRowItemProps {
  row: IngredientRow;
  search: string;
  suggestions: Ingredient[];
  canAddNew: boolean;
  onSearchChange: (val: string) => void;
  onSelectIngredient: (ing: Ingredient) => void;
  onAddNew: (name: string) => void;
  onChange: (patch: Partial<IngredientRow>) => void;
  onRemove: () => void;
}

/**
 * @component
 * @description 레시피 재료 한 행. 재료 검색 + 용량 입력 포함
 */
function IngredientRowItem({ row, search, suggestions, canAddNew, onSearchChange, onSelectIngredient, onAddNew, onChange, onRemove }: IngredientRowItemProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputCls = "w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900";
  const isNew = !!row.newIngredientName;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      {/* 1행: 재료 검색(또는 신규 확정 표시) + 삭제 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {isNew ? (
            // 신규 재료 확정 상태 — 이름 고정 표시
            <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 dark:border-amber-700 dark:bg-amber-950/30">
              <span className="shrink-0 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white dark:bg-amber-600">
                신규
              </span>
              <span className="flex-1 text-xs text-zinc-800 dark:text-zinc-200">{row.newIngredientName}</span>
              <button
                type="button"
                onMouseDown={() => { onChange({ newIngredientName: "", unit: "" }); onSearchChange(""); }}
                className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                ×
              </button>
            </div>
          ) : (
            // 일반 검색 상태
            <>
              <input
                type="text"
                value={search}
                onChange={(e) => { onSearchChange(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className={inputCls}
                placeholder="재료 검색..."
              />
              {showDropdown && (suggestions.length > 0 || canAddNew) && (
                <ul className="absolute z-50 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                  {suggestions.map((ing) => (
                    <li
                      key={ing.id}
                      onMouseDown={() => onSelectIngredient(ing)}
                      className="cursor-pointer px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    >
                      <span className="font-medium">{ing.name}</span>
                      <span className="ml-1.5 text-zinc-400">({ing.unit})</span>
                    </li>
                  ))}
                  {canAddNew && (
                    <li
                      onMouseDown={() => onAddNew(search.trim())}
                      className="cursor-pointer border-t border-zinc-100 px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 dark:border-zinc-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
                    >
                      + 새로 추가: <span className="font-medium">{search.trim()}</span>
                    </li>
                  )}
                </ul>
              )}
            </>
          )}
        </div>
        <button type="button" onClick={onRemove} className="shrink-0 text-zinc-400 hover:text-red-500">
          <Trash2 size={14} />
        </button>
      </div>

      {/* 2행: 그룹 태그 · 용량(+단위) */}
      <div className="flex items-center gap-2">
        {row.groupLabel && (
          <span className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            {row.groupLabel}
          </span>
        )}
        <div className="flex shrink-0 items-center gap-1">
          <input
            type="number"
            value={row.amount}
            onChange={(e) => onChange({ amount: e.target.value })}
            className="w-20 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="용량"
            step="0.01"
          />
          {isNew ? (
            // 신규 재료는 단위를 직접 선택
            <select
              value={row.unit || "g"}
              onChange={(e) => onChange({ unit: e.target.value })}
              className="rounded-md border border-zinc-200 bg-white px-1.5 py-1.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="ea">ea</option>
            </select>
          ) : (
            row.unit && <span className="text-xs text-zinc-400">{row.unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 대체재료 행 서브컴포넌트 ─────────────────────────────────────────────────

interface SubstituteRowItemProps {
  row: SubstituteRow;
  origSearch: string;
  subSearch: string;
  // 원본 재료 후보: 현재 레시피에 등록된 재료만
  origSuggestions: Ingredient[];
  // 대체 재료 후보: 전체 재료
  subSuggestions: Ingredient[];
  canAddNewSub: boolean;
  onOrigSearchChange: (val: string) => void;
  onSubSearchChange: (val: string) => void;
  onSelectOrig: (ing: Ingredient) => void;
  onSelectSub: (ing: Ingredient) => void;
  onAddNewSub: (name: string) => void;
  onChange: (patch: Partial<SubstituteRow>) => void;
  onRemove: () => void;
}

/**
 * @component
 * @description 레시피 대체재료 한 행. 원본 재료(레시피 내 재료만) → 대체 재료(신규 추가 가능) 검색 포함
 */
function SubstituteRowItem({ row, origSearch, subSearch, origSuggestions, subSuggestions, canAddNewSub, onOrigSearchChange, onSubSearchChange, onSelectOrig, onSelectSub, onAddNewSub, onChange, onRemove }: SubstituteRowItemProps) {
  const [showOrig, setShowOrig] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const inputCls = "w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900";
  const isNewSub = !!row.newSubIngredientName;

  const filterOrig = (search: string) => {
    if (!search.trim()) return origSuggestions.slice(0, 6);
    const lower = search.toLowerCase();
    return origSuggestions.filter((i) => i.name.toLowerCase().includes(lower)).slice(0, 6);
  };

  const filterSub = (search: string) => {
    if (!search.trim()) return subSuggestions.slice(0, 6);
    const lower = search.toLowerCase();
    return subSuggestions.filter((i) => i.name.toLowerCase().includes(lower)).slice(0, 6);
  };

  return (
    <div className="flex items-start gap-2 rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      {/* 원본 재료: 현재 레시피 재료 목록에서만 선택 */}
      <div className="relative flex-1">
        <label className="text-[10px] text-zinc-400">원본 재료 (레시피 내)</label>
        <input
          type="text"
          value={origSearch}
          onChange={(e) => { onOrigSearchChange(e.target.value); setShowOrig(true); }}
          onFocus={() => setShowOrig(true)}
          onBlur={() => setTimeout(() => setShowOrig(false), 150)}
          className={inputCls}
          placeholder="레시피 재료 검색..."
        />
        {showOrig && filterOrig(origSearch).length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            {filterOrig(origSearch).map((ing) => (
              <li key={ing.id} onMouseDown={() => onSelectOrig(ing)} className="cursor-pointer px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700">
                {ing.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <span className="mt-5 shrink-0 text-zinc-400">→</span>

      {/* 대체 재료: 전체 재료 + 신규 추가 가능 */}
      <div className="relative flex-1">
        <label className="text-[10px] text-zinc-400">대체 재료</label>
        {isNewSub ? (
          <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 dark:border-amber-700 dark:bg-amber-950/30">
            <span className="shrink-0 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white dark:bg-amber-600">
              신규
            </span>
            <span className="flex-1 text-xs text-zinc-800 dark:text-zinc-200">{row.newSubIngredientName}</span>
            <select
              value={row.newSubIngredientUnit || "g"}
              onChange={(e) => onChange({ newSubIngredientUnit: e.target.value })}
              className="rounded border border-zinc-200 bg-white px-1 py-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="ea">ea</option>
            </select>
            <button
              type="button"
              onMouseDown={() => { onChange({ newSubIngredientName: "", newSubIngredientUnit: "" }); onSubSearchChange(""); }}
              className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={subSearch}
              onChange={(e) => { onSubSearchChange(e.target.value); setShowSub(true); }}
              onFocus={() => setShowSub(true)}
              onBlur={() => setTimeout(() => setShowSub(false), 150)}
              className={inputCls}
              placeholder="검색..."
            />
            {showSub && (filterSub(subSearch).length > 0 || canAddNewSub) && (
              <ul className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                {filterSub(subSearch).map((ing) => (
                  <li key={ing.id} onMouseDown={() => onSelectSub(ing)} className="cursor-pointer px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700">
                    {ing.name}
                  </li>
                ))}
                {canAddNewSub && (
                  <li
                    onMouseDown={() => onAddNewSub(subSearch.trim())}
                    className="cursor-pointer border-t border-zinc-100 px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 dark:border-zinc-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
                  >
                    + 새로 추가: <span className="font-medium">{subSearch.trim()}</span>
                  </li>
                )}
              </ul>
            )}
          </>
        )}
      </div>

      {/* 메모 */}
      <div className="flex-1">
        <label className="text-[10px] text-zinc-400">메모</label>
        <input
          type="text"
          value={row.memo}
          onChange={(e) => onChange({ memo: e.target.value })}
          className={inputCls}
          placeholder="대체 이유"
        />
      </div>

      <button type="button" onClick={onRemove} className="mt-5 shrink-0 text-zinc-400 hover:text-red-500">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
