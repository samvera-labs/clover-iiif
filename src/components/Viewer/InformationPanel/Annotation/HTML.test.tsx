import { render, screen } from "@testing-library/react";

import AnnotationItemHTML from "./HTML";
import React from "react";
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();

const props = {
  value: `
        <p>Foo bar label here and <a href="https://www.northwestern.edu">this is a link</a></p>
    `,
  handleClick: vitest.fn(),
};

describe("AnnotationItemHTML", () => {
  it("should render the component", () => {
    render(<AnnotationItemHTML {...props} />);
    expect(screen.getByText("Foo bar label here and")).toBeInTheDocument();
    expect(screen.getByText("this is a link")).toHaveAttribute(
      `href`,
      `https://www.northwestern.edu`,
    );
  });

  it("should handle the click event", async () => {
    const handleClick = vitest.fn();

    render(
      <AnnotationItemHTML value={props.value} handleClick={handleClick} />,
    );
    const el = screen.getByText("Foo bar label", { exact: false });
    await user.click(el);
    expect(handleClick).toHaveBeenCalled();
  });
});
