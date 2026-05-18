import type { Meta, StoryObj } from "@storybook/react";
import { FormLabel } from "../components/FormLabel";
import { Input } from "../components/Input";

const meta: Meta<typeof FormLabel> = {
  title: "UI/FormLabel",
  component: FormLabel,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "sm"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof FormLabel>;

export const Default: Story = {
  args: { variant: "default", children: "재료명" },
};

export const Sm: Story = {
  args: { variant: "sm", children: "배치 크기 (g)" },
};

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 w-64">
      <FormLabel htmlFor="name">재료명</FormLabel>
      <Input id="name" placeholder="예: 팜유" />
    </div>
  ),
};

export const SmWithInput: Story = {
  render: () => (
    <div className="flex flex-col w-64">
      <FormLabel variant="sm" htmlFor="batchSize">배치 크기 (g) *</FormLabel>
      <Input variant="sm" id="batchSize" type="number" placeholder="예: 540" className="w-full" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <div className="flex flex-col gap-1.5">
        <FormLabel htmlFor="required-field">
          재료명 <span className="text-red-500">*</span>
        </FormLabel>
        <Input id="required-field" placeholder="필수 항목" />
      </div>
      <div className="flex flex-col">
        <FormLabel variant="sm" htmlFor="required-sm">
          배치 크기 (g) <span className="text-red-500">*</span>
        </FormLabel>
        <Input variant="sm" id="required-sm" type="number" className="w-full" />
      </div>
    </div>
  ),
};
