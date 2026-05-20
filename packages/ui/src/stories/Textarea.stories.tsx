import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "../components/Textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "mono"] },
  },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { variant: "default", placeholder: "메모를 입력하세요", rows: 3 },
};

export const Mono: Story = {
  args: {
    variant: "mono",
    placeholder: '[{"ingredientId": "...", "name": "...", "deduct": 100}]',
    rows: 6,
  },
};
