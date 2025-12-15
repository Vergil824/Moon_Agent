import { render, screen } from "@testing-library/react";

import { Card, CardContent, CardTitle } from "./card";
import { Input } from "./input";

describe("Shadcn UI primitives", () => {
  it("renders Card + subcomponents", () => {
    render(
      <Card>
        <CardTitle>Title</CardTitle>
        <CardContent>Body</CardContent>
      </Card>
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("renders Input", () => {
    render(<Input aria-label="chat-input" />);
    expect(screen.getByLabelText("chat-input")).toBeInTheDocument();
  });
});


