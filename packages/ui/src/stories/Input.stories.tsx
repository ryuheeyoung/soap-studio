import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "../components/Input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "sm"] },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { variant: "default", placeholder: "재료명을 입력하세요" },
};

export const Small: Story = {
  args: { variant: "sm", placeholder: "수량" },
};

export const Disabled: Story = {
  args: { variant: "default", placeholder: "비활성 입력", disabled: true },
};

export const WithValue: Story = {
  args: { variant: "default", defaultValue: "코코넛오일" },
};
