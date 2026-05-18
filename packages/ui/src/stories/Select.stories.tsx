import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "../components/Select";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "sm"] },
  },
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <option value="">카테고리 선택</option>
      <option value="oil">오일류</option>
      <option value="butter">버터류</option>
      <option value="essential_oil">에센셜오일</option>
    </Select>
  ),
  args: { variant: "default" },
};

export const Small: Story = {
  render: (args) => (
    <Select {...args}>
      <option value="g">g</option>
      <option value="ml">ml</option>
      <option value="ea">ea</option>
    </Select>
  ),
  args: { variant: "sm" },
};
