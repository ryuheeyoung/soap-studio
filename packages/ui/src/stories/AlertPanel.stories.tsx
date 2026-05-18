import type { Meta, StoryObj } from "@storybook/react";
import { AlertPanel } from "../components/AlertPanel";

const meta: Meta<typeof AlertPanel> = {
  title: "UI/AlertPanel",
  component: AlertPanel,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["success", "error", "warning"] },
  },
};
export default meta;

type Story = StoryObj<typeof AlertPanel>;

export const Success: Story = {
  args: {
    variant: "success",
    children: "모든 재료의 재고가 충분합니다.",
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    children: "재고가 부족한 재료가 있습니다. 구매 후 재고를 추가해주세요.",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "일부 재료를 차감하면 재고가 0 미만이 됩니다. 0으로 고정됩니다.",
  },
};
