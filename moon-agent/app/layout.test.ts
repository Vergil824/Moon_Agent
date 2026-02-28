import { viewport } from "./layout";

describe("layout viewport", () => {
  it("sets mobile-first viewport and disables user scaling", () => {
    expect(viewport.width).toBe("device-width");
    expect(viewport.initialScale).toBe(1);
    expect(viewport.maximumScale).toBe(1);
    expect(viewport.userScalable).toBe(false);
  });
});


