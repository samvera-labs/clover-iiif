import { act, fireEvent, render, screen } from "@testing-library/react";
import React, { useState } from "react";

import { useOneOpen } from "./useOneOpen";

function Popup({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  useOneOpen(open, () => setOpen(false));
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        {`Open ${name}`}
      </button>
      {open && <p>{`${name} is open`}</p>}
    </div>
  );
}

describe("useOneOpen", () => {
  it("closes the open popup when another opens, however it was opened", () => {
    render(
      <>
        <Popup name="Information" />
        <Popup name="Annotations" />
      </>,
    );
    fireEvent.click(screen.getByText("Open Information"));
    expect(screen.getByText("Information is open")).toBeInTheDocument();

    // A key opens it too: no press outside to close the first.
    act(() => screen.getByText("Open Annotations").click());
    expect(screen.getByText("Annotations is open")).toBeInTheDocument();
    expect(screen.queryByText("Information is open")).toBeNull();

    fireEvent.click(screen.getByText("Open Information"));
    expect(screen.getByText("Information is open")).toBeInTheDocument();
    expect(screen.queryByText("Annotations is open")).toBeNull();
  });

  it("leaves the others alone while it stays closed", () => {
    render(
      <>
        <Popup name="Information" />
        <Popup name="Download" />
      </>,
    );
    fireEvent.click(screen.getByText("Open Information"));
    expect(screen.getByText("Information is open")).toBeInTheDocument();
    expect(screen.queryByText("Download is open")).toBeNull();
  });
});
