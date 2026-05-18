import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../components/Badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "mp", "cp", "hp"] },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { variant: "default", children: "오일" },
};

export const MP: Story = {
  args: { variant: "mp", children: "M&P" },
};

export const CP: Story = {
  args: { variant: "cp", children: "CP" },
};

export const HP: Story = {
  args: { variant: "hp", children: "HP" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge variant="default">오일</Badge>
      <Badge variant="mp">M&P</Badge>
      <Badge variant="cp">CP</Badge>
      <Badge variant="hp">HP</Badge>
    </div>
  ),
};
