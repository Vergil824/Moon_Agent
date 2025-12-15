import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { getStateComponent, StateComponentMap } from "./StateComponents";
import { WelcomeOptions } from "./WelcomeOptions";
import { MeasureGuide } from "./MeasureGuide";
import { AuxiliaryInput } from "./AuxiliaryInput";
import { ShapeSelection } from "./ShapeSelection";
import { PainPointGrid } from "./PainPointGrid";

function stripMotionProps<T extends Record<string, unknown>>(props: T) {
  const {
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    layout,
    layoutId,
    variants,
    ...rest
  } = props as Record<string, unknown>;
  return rest as T;
}

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => {
      const safe = stripMotionProps(props as Record<string, unknown>);
      return <div {...safe}>{children}</div>;
    },
    button: ({
      children,
      onClick,
      ...props
    }: React.PropsWithChildren<{ onClick?: () => void }>) => (
      <button onClick={onClick} {...stripMotionProps(props as any)}>
        {children}
      </button>
    )
  }
}));

describe("StateComponents", () => {
  describe("getStateComponent", () => {
    it("returns WelcomeOptions for step='welcome'", () => {
      const mockOnSelect = vi.fn();
      const Component = getStateComponent({ step: "welcome" });
      
      expect(Component).not.toBeNull();
      if (Component) {
        render(<Component onSelect={mockOnSelect} />);
        expect(screen.getByText("准备好了！")).toBeInTheDocument();
        expect(screen.getByText("有点紧张")).toBeInTheDocument();
      }
    });

    it("returns null for unknown step", () => {
      const Component = getStateComponent({ step: "unknown_step" });
      expect(Component).toBeNull();
    });

    it("returns MeasureGuide for step='size_input'", () => {
      const mockOnSelect = vi.fn();
      const Component = getStateComponent({ step: "size_input" });

      expect(Component).not.toBeNull();
      if (Component) {
        render(<Component onSelect={mockOnSelect} />);
        expect(screen.getByText("观看测量演示")).toBeInTheDocument();
      }
    });

    it("returns ShapeSelection for step='shape_choice'", () => {
      const mockOnSelect = vi.fn();
      const Component = getStateComponent({ step: "shape_choice" });

      expect(Component).not.toBeNull();
      if (Component) {
        render(<Component onSelect={mockOnSelect} />);
        expect(screen.getByText("圆盘型")).toBeInTheDocument();
        expect(screen.getByText("纺锤型")).toBeInTheDocument();
        expect(screen.getByText("半球型")).toBeInTheDocument();
      }
    });

    it("returns PainPointGrid for step='pain_points'", () => {
      const mockOnSelect = vi.fn();
      const Component = getStateComponent({ step: "pain_points" });

      expect(Component).not.toBeNull();
      if (Component) {
        render(<Component onSelect={mockOnSelect} />);
        expect(screen.getByText("钢圈戳腋下")).toBeInTheDocument();
        expect(screen.getByText("疯狂跑杯")).toBeInTheDocument();
        expect(screen.getByText("确认痛点")).toBeInTheDocument();
      }
    });

    it("returns null for null state", () => {
      const Component = getStateComponent(null);
      expect(Component).toBeNull();
    });

    it("returns null for state without step property", () => {
      const Component = getStateComponent({ other: "value" });
      expect(Component).toBeNull();
    });
  });

  describe("StateComponentMap", () => {
    it("has welcome mapped to WelcomeOptions", () => {
      expect(StateComponentMap.welcome).toBe(WelcomeOptions);
    });

    it("has size_input mapped to MeasureGuide", () => {
      expect(StateComponentMap.size_input).toBe(MeasureGuide);
    });

    it("has body_info mapped to AuxiliaryInput", () => {
      expect(StateComponentMap.body_info).toBe(AuxiliaryInput);
    });

    it("has shape_choice mapped to ShapeSelection", () => {
      expect(StateComponentMap.shape_choice).toBe(ShapeSelection);
    });

    it("has pain_points mapped to PainPointGrid", () => {
      expect(StateComponentMap.pain_points).toBe(PainPointGrid);
    });
  });
});

