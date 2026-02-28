import { render, screen, fireEvent } from "@testing-library/react";
import { Slider } from "./slider";

describe("Slider", () => {
  it("renders with label", () => {
    render(<Slider label="身高 (cm)" value={165} onChange={() => {}} />);

    expect(screen.getByText("身高 (cm)")).toBeInTheDocument();
  });

  it("renders with value and unit", () => {
    render(<Slider value={165} unit="cm" onChange={() => {}} />);

    // Value and unit are now in separate elements
    expect(screen.getByText("165")).toBeInTheDocument();
    expect(screen.getByText("cm")).toBeInTheDocument();
  });

  it("calls onChange when slider value changes", () => {
    const handleChange = vi.fn();
    render(
      <Slider min={140} max={200} value={165} onChange={handleChange} />
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "170" } });

    expect(handleChange).toHaveBeenCalledWith(170);
  });

  it("respects min and max attributes", () => {
    render(<Slider min={140} max={200} value={165} onChange={() => {}} />);

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "140");
    expect(slider).toHaveAttribute("max", "200");
  });

  it("hides value display when showValue is false", () => {
    render(<Slider value={165} unit="cm" showValue={false} onChange={() => {}} />);

    expect(screen.queryByText("165 cm")).not.toBeInTheDocument();
  });

  it("renders without label when not provided", () => {
    render(<Slider value={55} unit="kg" onChange={() => {}} />);

    // Value and unit are now in separate elements
    expect(screen.getByText("55")).toBeInTheDocument();
    expect(screen.getByText("kg")).toBeInTheDocument();
    // Should not have a label element
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Slider value={165} className="custom-class" onChange={() => {}} />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
