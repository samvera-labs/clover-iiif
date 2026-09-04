import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

import React from "react";
import Toggle from "src/components/Viewer/Painting/Toggle";

const renderToggle = (props = {}) =>
  render(
    <ViewerProvider initialState={{ ...defaultState }}>
      <Toggle
        handleToggle={vi.fn()}
        isInteractive={false}
        isMedia={false}
        {...props}
      />
    </ViewerProvider>,
  );

describe("Painting Toggle", () => {
  it("names what the button opens rather than the gesture", () => {
    renderToggle();

    expect(
      screen.getByRole("button", { name: "Open image viewer" }),
    ).toBeInTheDocument();
  });

  it("names what the button closes once the viewer is open", () => {
    renderToggle({ isInteractive: true });

    expect(
      screen.getByRole("button", { name: "Close image viewer" }),
    ).toBeInTheDocument();
  });

  /*
   * The icon was named through `aria-labelledby` and a literal id, so two viewers on a
   * page repeated it and both buttons resolved to the first title. An `svg[role="img"]`
   * takes its name from `<title>` alone, which cannot collide.
   */
  it("names its icon without an id to collide", () => {
    const { container } = render(
      <ViewerProvider initialState={{ ...defaultState }}>
        <Toggle handleToggle={vi.fn()} isInteractive={false} isMedia={false} />
        <Toggle handleToggle={vi.fn()} isInteractive={false} isMedia={false} />
      </ViewerProvider>,
    );

    expect(container.querySelectorAll("title")).toHaveLength(2);
    expect(container.querySelectorAll("[id]")).toHaveLength(0);
    expect(container.querySelectorAll("[aria-labelledby]")).toHaveLength(0);

    // Both buttons still carry the name, rather than sharing one.
    expect(
      screen.getAllByRole("button", { name: "Open image viewer" }),
    ).toHaveLength(2);
  });
});
