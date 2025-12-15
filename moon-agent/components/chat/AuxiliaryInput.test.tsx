import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuxiliaryInput } from "./AuxiliaryInput";
import { useChatStore } from "@/lib/store";
import { act } from "@testing-library/react";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }
}));

describe("AuxiliaryInput", () => {
  beforeEach(() => {
    // Reset store state before each test
    useChatStore.setState({
      messages: [],
      isTyping: false,
      isStreaming: false,
      currentState: null,
      measurementData: null,
      auxiliaryData: null
    });
  });

  it("renders three sliders with correct labels", () => {
    render(<AuxiliaryInput onSelect={() => {}} />);

    expect(screen.getByText("身高 (cm)")).toBeInTheDocument();
    expect(screen.getByText("体重 (kg)")).toBeInTheDocument();
    expect(screen.getByText("腰围 (cm)")).toBeInTheDocument();
  });

  it("renders confirm button", () => {
    render(<AuxiliaryInput onSelect={() => {}} />);

    expect(
      screen.getByRole("button", { name: "确认数据" })
    ).toBeInTheDocument();
  });

  it("displays default values", () => {
    render(<AuxiliaryInput onSelect={() => {}} />);

    // Values and units are now in separate elements
    expect(screen.getByText("165")).toBeInTheDocument();
    expect(screen.getByText("55")).toBeInTheDocument();
    expect(screen.getByText("68")).toBeInTheDocument();
  });

  it("updates height slider value on change", () => {
    render(<AuxiliaryInput onSelect={() => {}} />);

    const sliders = screen.getAllByRole("slider");
    const heightSlider = sliders[0]; // First slider is height

    fireEvent.change(heightSlider, { target: { value: "170" } });

    expect(screen.getByText("170")).toBeInTheDocument();
  });

  it("updates weight slider value on change", () => {
    render(<AuxiliaryInput onSelect={() => {}} />);

    const sliders = screen.getAllByRole("slider");
    const weightSlider = sliders[1]; // Second slider is weight

    fireEvent.change(weightSlider, { target: { value: "60" } });

    expect(screen.getByText("60")).toBeInTheDocument();
  });

  it("updates waist slider value on change", () => {
    render(<AuxiliaryInput onSelect={() => {}} />);

    const sliders = screen.getAllByRole("slider");
    const waistSlider = sliders[2]; // Third slider is waist

    fireEvent.change(waistSlider, { target: { value: "72" } });

    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("calls onSelect with natural language message when confirm is clicked", async () => {
    const handleSelect = vi.fn();
    render(<AuxiliaryInput onSelect={handleSelect} />);

    const confirmButton = screen.getByRole("button", { name: "确认数据" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalledWith(
        "我的身高是165cm，体重55kg，腰围68cm"
      );
    });
  });

  it("updates Zustand store with auxiliary data on confirm", async () => {
    render(<AuxiliaryInput onSelect={() => {}} />);

    // Change slider values
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "170" } }); // height
    fireEvent.change(sliders[1], { target: { value: "60" } }); // weight
    fireEvent.change(sliders[2], { target: { value: "72" } }); // waist

    const confirmButton = screen.getByRole("button", { name: "确认数据" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      const auxiliaryData = useChatStore.getState().auxiliaryData;
      expect(auxiliaryData).toEqual({
        height: 170,
        weight: 60,
        waist: 72
      });
    });
  });

  it("shows loading state when submitting", async () => {
    render(<AuxiliaryInput onSelect={() => {}} />);

    const confirmButton = screen.getByRole("button", { name: "确认数据" });
    fireEvent.click(confirmButton);

    // The button should show loading state briefly
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "确认数据" })
      ).toBeInTheDocument();
    });
  });

  it("has correct slider min/max ranges", () => {
    render(<AuxiliaryInput onSelect={() => {}} />);

    const sliders = screen.getAllByRole("slider");

    // Height slider: 140-200
    expect(sliders[0]).toHaveAttribute("min", "140");
    expect(sliders[0]).toHaveAttribute("max", "200");

    // Weight slider: 30-100
    expect(sliders[1]).toHaveAttribute("min", "30");
    expect(sliders[1]).toHaveAttribute("max", "100");

    // Waist slider: 50-120
    expect(sliders[2]).toHaveAttribute("min", "50");
    expect(sliders[2]).toHaveAttribute("max", "120");
  });
});
