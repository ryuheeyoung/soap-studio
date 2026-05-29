import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Stepper } from "../components/Stepper";

const meta: Meta<typeof Stepper> = {
  title: "UI/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  argTypes: {
    editable: { control: "boolean" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
};
export default meta;

type Story = StoryObj<typeof Stepper>;

export const Scale: Story = {
  name: "배율 조정 (×0.5 단위)",
  render: (args) => {
    const [value, setValue] = useState(1);
    return <Stepper {...args} value={value} onChange={setValue} />;
  },
  args: {
    min: 0.5,
    step: 0.5,
    format: (v: number) => `×${v}`,
  },
};

export const Quantity: Story = {
  name: "수량 입력 (editable)",
  render: (args) => {
    const [value, setValue] = useState(1);
    return <Stepper {...args} value={value} onChange={setValue} />;
  },
  args: {
    min: 1,
    step: 1,
    editable: true,
  },
};

export const WithMax: Story = {
  name: "최댓값 제한",
  render: (args) => {
    const [value, setValue] = useState(3);
    return <Stepper {...args} value={value} onChange={setValue} />;
  },
  args: {
    min: 1,
    max: 5,
    step: 1,
    editable: true,
  },
};
