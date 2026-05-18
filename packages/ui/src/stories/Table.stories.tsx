import type { Meta, StoryObj } from "@storybook/react";
import { TableWrapper, Table, Th, Td } from "../components/Table";

const meta: Meta = {
  title: "UI/Table",
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj;

// ── 기본 테이블 ────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <TableWrapper>
      <Table>
        <thead>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <Th>재료명</Th>
            <Th>카테고리</Th>
            <Th align="right">재고</Th>
          </tr>
        </thead>
        <tbody>
          {[
            { name: "팜유", category: "오일류", stock: "1,200 g" },
            { name: "코코넛오일", category: "오일류", stock: "800 g" },
            { name: "가성소다", category: "알칼리류", stock: "300 g" },
          ].map((row) => (
            <tr key={row.name} className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
              <Td className="font-medium text-zinc-900 dark:text-zinc-50">{row.name}</Td>
              <Td className="text-zinc-500">{row.category}</Td>
              <Td align="right" className="text-zinc-700 dark:text-zinc-300">{row.stock}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  ),
};

// ── 재고 추가 미리보기 (StockAdjustPanel 패턴) ──────────────────────────────────

export const StockAdjustPreview: Story = {
  render: () => (
    <TableWrapper>
      <Table>
        <thead>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <Th>재료명</Th>
            <Th align="right">현재 재고</Th>
            <Th align="right">추가량</Th>
            <Th align="right">적용 후</Th>
          </tr>
        </thead>
        <tbody>
          {[
            { name: "팜유", current: "1,200 g", add: "+500 g", after: "1,700 g", addColor: "text-emerald-600 dark:text-emerald-400" },
            { name: "코코넛오일", current: "800 g", add: "+1,000 g", after: "1,800 g", addColor: "text-emerald-600 dark:text-emerald-400" },
            { name: "가성소다", current: "300 g", add: "+200 g", after: "500 g", addColor: "text-emerald-600 dark:text-emerald-400" },
          ].map((row) => (
            <tr key={row.name} className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
              <Td className="font-medium text-zinc-900 dark:text-zinc-50">{row.name}</Td>
              <Td align="right" className="text-zinc-500">{row.current}</Td>
              <Td align="right" className={`font-medium ${row.addColor}`}>{row.add}</Td>
              <Td align="right" className="font-semibold text-zinc-900 dark:text-zinc-50">{row.after}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  ),
};

// ── 재고 차감 미리보기 (StockDeductPanel 패턴) ──────────────────────────────────

export const StockDeductPreview: Story = {
  render: () => (
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
          {[
            { name: "팜유", current: "1,200 g", deduct: "-450 g", after: "750 g", insufficient: false, found: true },
            { name: "코코넛오일", current: "200 g", deduct: "-350 g", after: "0 g", insufficient: true, found: true },
            { name: "라벤더 EO", current: "0 g", deduct: "-10 g", after: "0 g", insufficient: false, found: false },
          ].map((row) => (
            <tr
              key={row.name}
              className={`border-b border-zinc-50 last:border-0 dark:border-zinc-800 ${!row.found ? "opacity-40" : ""}`}
            >
              <Td>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{row.name}</span>
                {!row.found && <span className="ml-2 text-xs text-red-400">미등록 재료</span>}
              </Td>
              <Td align="right" className="text-zinc-500">{row.current}</Td>
              <Td align="right" className="font-medium text-red-500">{row.deduct}</Td>
              <Td align="right" className={`font-semibold ${row.insufficient ? "text-amber-500" : "text-zinc-900 dark:text-zinc-50"}`}>
                {row.after}
                {row.insufficient && <span className="ml-1 text-xs font-normal text-amber-400">(부족)</span>}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  ),
};

// ── 빈 상태 ─────────────────────────────────────────────────────────────────────

export const Empty: Story = {
  render: () => (
    <TableWrapper>
      <Table>
        <thead>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <Th>재료명</Th>
            <Th>카테고리</Th>
            <Th align="right">재고</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td colSpan={3} className="text-center text-zinc-400 py-8">
              등록된 재료가 없어요.
            </Td>
          </tr>
        </tbody>
      </Table>
    </TableWrapper>
  ),
};

// ── Th / Td 정렬 옵션 ────────────────────────────────────────────────────────────

export const AlignOptions: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-zinc-400 mb-1">left (기본) / right (숫자 데이터)</p>
      <TableWrapper>
        <Table>
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <Th>왼쪽 정렬 (기본)</Th>
              <Th align="right">오른쪽 정렬</Th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
              <Td>팜유</Td>
              <Td align="right">1,200 g</Td>
            </tr>
            <tr className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
              <Td>코코넛오일</Td>
              <Td align="right">800 g</Td>
            </tr>
          </tbody>
        </Table>
      </TableWrapper>
    </div>
  ),
};
