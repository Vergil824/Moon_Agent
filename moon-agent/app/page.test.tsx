import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders CTA button", () => {
    render(<Home />);
    expect(
      screen.getByRole("button", { name: /launch workspace/i })
    ).toBeInTheDocument();
  });
});

