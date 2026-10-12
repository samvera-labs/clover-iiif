import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { initCloverI18n } from "../i18n";
import Button from "./Button";
import { SHORTCUTS, Tip, forwardShortcut } from "./Tip";

afterEach(() => initCloverI18n({ lng: "en" }));

describe("Tip", () => {
  it("says what the control's accessible name says, and its key", () => {
    initCloverI18n({ lng: "en" });
    render(
      <Button id="zoomIn-1" label="Zoom in" shortcut={SHORTCUTS.zoomIn}>
        <path d="" />
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Zoom in" });
    expect(button).toHaveAttribute("aria-keyshortcuts", "Plus");
    const tip = button.querySelector(".clover-tip")!;
    expect(tip).toHaveTextContent("Zoom in (+)");
    // The button carries the name; the popover is not read a second time.
    expect(tip).toHaveAttribute("aria-hidden", "true");
    // No SVG <title>, which browsers would show as a tooltip of their own.
    expect(button.querySelector("title")).toBeNull();
  });

  it("takes its format from the language's strings", () => {
    initCloverI18n({
      lng: "xx",
      resources: {
        xx: { clover: { controlShortcut: "{{shortcut}} : {{label}}" } },
      },
    });
    render(<Tip label="Muet" shortcut={SHORTCUTS.mute} />);
    expect(screen.getByText("M : Muet")).toBeInTheDocument();
  });

  it("shows the name alone for a control with no key", () => {
    render(<Tip label="Close" />);
    expect(screen.getByText("Close")).toHaveClass("clover-tip");
  });

  it("hides on Escape until focus leaves (WCAG 1.4.13)", () => {
    render(
      <Button id="reset-1" label="Reset" shortcut={SHORTCUTS.reset}>
        <path d="" />
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Reset" });
    button.focus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(button).toHaveAttribute("data-tip-hidden");
    fireEvent.blur(button);
    expect(button).not.toHaveAttribute("data-tip-hidden");
  });
});

describe("forwardShortcut", () => {
  function Stage() {
    const viewport = React.useRef<HTMLDivElement>(null);
    return (
      <figure onKeyDown={(event) => forwardShortcut(event, viewport.current)}>
        <button type="button">Zoom in</button>
        <input aria-label="Volume" />
        <div ref={viewport} data-testid="viewport" tabIndex={0} />
      </figure>
    );
  }

  it("sends a Canvas key pressed on one of its controls to the viewport", () => {
    render(<Stage />);
    const keys: string[] = [];
    screen
      .getByTestId("viewport")
      .addEventListener("keydown", (event) => keys.push(event.key));
    const button = screen.getByRole("button", { name: "Zoom in" });
    fireEvent.keyDown(button, { key: "+" });
    fireEvent.keyDown(button, { key: "R", shiftKey: true });
    // A key the control uses itself, and one typed into a field, are left alone.
    fireEvent.keyDown(button, { key: " " });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Volume" }), {
      key: "m",
    });
    expect(keys).toEqual(["+", "R"]);
  });
});
