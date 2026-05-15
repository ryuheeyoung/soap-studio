import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../components/Card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "row"] },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    variant: "default",
    children: <p className="text-sm text-zinc-700 dark:text-zinc-300">카드 내용이 들어갑니다.</p>,
    className: "p-4",
  },
};

export const Row: Story = {
  args: {
    variant: "row",
    children: <p className="text-sm text-zinc-700">행 카드 — 재료 행 등 컴팩트 레이아웃</p>,
  },
};

export const WithErrorBorder: Story = {
  args: {
    variant: "default",
    borderColor: "border-red-200 dark:border-red-900",
    children: <p className="p-4 text-sm text-red-600">재고 부족 재료가 있는 카드</p>,
  },
};
