import { fireEvent, render, screen } from "@testing-library/react";

import Cue from "src/components/Viewer/InformationPanel/Annotation/VTT/Cue";
import * as RadioGroup from "@radix-ui/react-radio-group";
import React from "react";
import * as viewerContext from "src/context/viewer-context";

describe("Information panel cue component", () => {
  afterEach(() => vi.restoreAllMocks());

  function renderCue(video: HTMLVideoElement, start = 107, end = 150) {
    vi.spyOn(viewerContext, "useViewerState").mockReturnValue({
      ...viewerContext.defaultState,
      activePlayer: video,
      isAutoScrollEnabled: false,
    });
    return (
      <RadioGroup.Root>
        <Cue html="Text" text="Text" start={start} end={end} />
      </RadioGroup.Root>
    );
  }

  it("marks the current cue immediately and follows its time boundaries", () => {
    const video = document.createElement("video");
    video.currentTime = 107;
    render(renderCue(video));
    const cue = screen.getByRole("radio");
    expect(cue).toHaveAttribute("aria-checked", "true");

    video.currentTime = 150;
    fireEvent(video, new Event("timeupdate"));
    expect(cue).toHaveAttribute("aria-checked", "false");
    video.currentTime = 149;
    fireEvent(video, new Event("timeupdate"));
    expect(cue).toHaveAttribute("aria-checked", "true");
  });

  it("ignores events from the previous player after switching canvases", () => {
    const previous = document.createElement("video");
    const current = document.createElement("video");
    previous.currentTime = 120;
    const { rerender } = render(renderCue(previous));
    rerender(renderCue(current));
    const cue = screen.getByRole("radio");
    expect(cue).toHaveAttribute("aria-checked", "false");

    fireEvent(previous, new Event("timeupdate"));
    expect(cue).toHaveAttribute("aria-checked", "false");
    current.currentTime = 120;
    fireEvent(current, new Event("timeupdate"));
    expect(cue).toHaveAttribute("aria-checked", "true");
  });

  it("updates the highlighted interval when a transcript cue is replaced", () => {
    const video = document.createElement("video");
    video.currentTime = 120;
    const { rerender } = render(renderCue(video));
    rerender(renderCue(video, 150, 200));
    expect(screen.getByRole("radio")).toHaveAttribute("aria-checked", "false");
  });

  it("removes every subscription on unmount, including StrictMode's trial mount", () => {
    const video = document.createElement("video");
    const add = vi.spyOn(video, "addEventListener");
    const remove = vi.spyOn(video, "removeEventListener");
    const { unmount } = render(
      <React.StrictMode>{renderCue(video)}</React.StrictMode>,
    );
    unmount();
    const subscriptions = add.mock.calls.filter(
      ([type]) => type === "timeupdate",
    );
    const removals = remove.mock.calls.filter(
      ([type]) => type === "timeupdate",
    );
    expect(subscriptions.length).toBeGreaterThan(0);
    expect(removals).toEqual(subscriptions);
  });

  it("renders", () => {
    render(
      /*
       * The wrapper is only here for RadioGroup context — a `RadioGroup.Item` throws
       * without a Root. It was the styled `Group` before; the styling is now a class on
       * the Root, which this test has no reason to care about.
       */
      <RadioGroup.Root>
        <Cue html="<div>Text</div>" text="Text" start={107} end={150} />
      </RadioGroup.Root>,
    );
    const cue = screen.getByTestId("information-panel-cue");
    expect(cue);
    expect(cue.hasAttribute("aria-checked")).toBe(true);
    // The row shape is shared with an annotation item; the cue adds its own class.
    expect(cue).toHaveClass("clover-annotation-row", "clover-viewer-vtt-cue");
  });
});
