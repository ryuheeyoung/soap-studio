import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "text"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary", children: "저장하기" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "취소" },
};

export const Text: Story = {
  args: { variant: "text", children: "전체 삭제" },
};

export const Disabled: Story = {
  args: { variant: "primary", children: "저장 중...", disabled: true },
};

export const SecondaryDisabled: Story = {
  args: { variant: "secondary", children: "적용 불가", disabled: true },
};
