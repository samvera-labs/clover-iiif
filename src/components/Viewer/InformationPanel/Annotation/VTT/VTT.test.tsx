import { render, screen, waitFor } from "@testing-library/react";

import AnnotationItemVTT from "./VTT";
import Menu from "src/components/Viewer/InformationPanel/Menu";
import React from "react";
import * as viewerContext from "src/context/viewer-context";
import userEvent from "@testing-library/user-event";

vi.mock("src/components/Viewer/InformationPanel/Menu");
vi.mocked(Menu).mockReturnValue(<div>Menu Component</div>);

/**
 * The shared `Select` stands in as a native one.
 *
 * Radix builds its listbox on pointer capture and `scrollIntoView`, neither of which jsdom
 * implements, so driving the real thing here would test the mock polyfills rather than this
 * component. What belongs to this component is the wiring — which value is selected, and what
 * it dispatches when that changes — and a native `<select>` exercises exactly that.
 */
vi.mock("src/components/UI/Select", () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select
      data-testid="vtt-track-select"
      onChange={(event) => onValueChange(event.target.value)}
      value={value}
    >
      {children}
    </select>
  ),
  SelectOption: ({ label, value }: any) => (
    <option value={value}>{label.none[0]}</option>
  ),
}));

const props = {
  label: {
    en: ["Captions in WebVTT format"],
  },
  vttUri: "https://example.com/image.jpg",
};

describe("AnnotationItemVTT", () => {
  it("should render the component and aria-label caption", () => {
    render(<AnnotationItemVTT {...props} />);
    const el = screen.getByTestId("annotation-item-vtt");
    expect(el).toHaveAttribute("aria-label", "Captions in WebVTT format");
  });

  it("should render the child Menu component", () => {
    render(<AnnotationItemVTT {...props} />);
    expect(screen.getByText("Menu Component")).toBeInTheDocument();
  });

  it("should make a request to the provided URI", () => {
    global.fetch = vitest.fn(() =>
      Promise.resolve(
        new Response("WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\nCaption"),
      ),
    );
    render(<AnnotationItemVTT {...props} />);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith("https://example.com/image.jpg", {
      redirect: "follow",
      headers: {
        Accept: "text/vtt, text/plain, */*",
      },
      // Carried so a language switch can abandon the request it supersedes.
      signal: expect.any(AbortSignal),
    });
  });

  it("should handle a failed network request to the provided URI", async () => {
    global.fetch = vitest.fn(() =>
      Promise.reject(new Error("I am the error message")),
    );

    render(<AnnotationItemVTT {...props} />);
    expect(await screen.findByTestId("error-message")).toHaveTextContent(
      "Network Error: Error: I am the error message",
    );
  });
});

/**
 * A `supplementing` annotation may offer one caption file per language inside a `Choice`.
 * The transcript gets a picker for them, and shares its choice with the player's captions
 * menu — but only the *choice*. Whether the player is drawing captions over the video is a
 * separate concern, and switching that off must leave the transcript here readable.
 *
 * @see https://iiif.io/api/cookbook/recipe/0074-multiple-language-captions/
 */
describe("AnnotationItemVTT with a Choice of caption tracks", () => {
  const captionResources = [
    {
      id: "https://example.org/en.vtt",
      label: { en: ["Captions in WebVTT format"] },
      language: "en",
    },
    {
      id: "https://example.org/it.vtt",
      label: { it: ["Sottotitoli in formato WebVTT"] },
      language: "it",
    },
  ];

  function renderWithState(activeCaptionSrc?: string) {
    const dispatch = vitest.fn();
    vitest.spyOn(viewerContext, "useViewerState").mockReturnValue({
      activeCaptionSrc,
    } as any);
    vitest.spyOn(viewerContext, "useViewerDispatch").mockReturnValue(dispatch);

    const result = render(
      <AnnotationItemVTT {...props} captionResources={captionResources} />,
    );
    return { ...result, dispatch };
  }

  beforeEach(() => {
    global.fetch = vitest.fn(() =>
      Promise.resolve(
        new Response("WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\nCaption"),
      ),
    ) as any;
  });

  afterEach(() => vitest.restoreAllMocks());

  it("offers an option per language, labelled in that language", () => {
    renderWithState();
    expect(
      screen.getByTestId("annotation-item-vtt-tracks"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Captions in WebVTT format" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Sottotitoli in formato WebVTT" }),
    ).toBeInTheDocument();
  });

  it("falls back to the first track when nothing is selected yet", () => {
    renderWithState();
    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.org/en.vtt",
      expect.anything(),
    );
  });

  /**
   * The point of the shared selection: switching language in the player moves the transcript
   * with it, without the panel having to know anything about the player.
   */
  it("follows the shared selection rather than the first track", () => {
    renderWithState("https://example.org/it.vtt");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.org/it.vtt",
      expect.anything(),
    );
    expect(screen.getByTestId("vtt-track-select")).toHaveValue(
      "https://example.org/it.vtt",
    );
  });

  it("publishes its own choice for the player to follow", async () => {
    const { dispatch } = renderWithState();
    await userEvent.selectOptions(
      screen.getByTestId("vtt-track-select"),
      "https://example.org/it.vtt",
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "updateActiveCaptionSrc",
      activeCaptionSrc: "https://example.org/it.vtt",
    });
  });

  /**
   * The bug the dropdown was asked for alongside: two language switches in quick succession
   * left two fetches racing, and the slower one wrote last. The picker then said one language
   * while the transcript showed the other, and nothing re-fetched to correct it.
   */
  it("ignores a superseded response when the language changes mid-flight", async () => {
    const bodies: Record<string, string> = {
      "https://example.org/en.vtt":
        "WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\nEnglish",
      "https://example.org/it.vtt":
        "WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\nItaliano",
    };
    const resolvers: Array<() => void> = [];
    global.fetch = vitest.fn(
      (url: string) =>
        new Promise((resolve) =>
          resolvers.push(() => resolve(new Response(bodies[url]))),
        ),
    ) as any;

    const { rerender } = renderWithState("https://example.org/en.vtt");

    // The language changes before the first response lands.
    vitest.spyOn(viewerContext, "useViewerState").mockReturnValue({
      activeCaptionSrc: "https://example.org/it.vtt",
    } as any);
    rerender(
      <AnnotationItemVTT {...props} captionResources={captionResources} />,
    );

    // Both land, oldest last.
    resolvers.reverse().forEach((resolve) => resolve());
    await waitFor(() =>
      expect(screen.getByTestId("vtt-track-select")).toHaveValue(
        "https://example.org/it.vtt",
      ),
    );

    // The superseded English request must never have written cues.
    expect(vi.mocked(Menu).mock.calls.at(-1)?.[0].items).not.toContainEqual(
      expect.objectContaining({ text: "English" }),
    );
  });

  /**
   * `activeCaptionSrc` is a selection, never a visibility flag — there is no state here that
   * the player could switch off. This pins that: a selection belonging to another canvas's
   * annotation still leaves a usable transcript rather than an empty one.
   */
  it("stays readable when the shared selection is not one of its tracks", () => {
    renderWithState("https://example.org/some-other-canvas.vtt");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.org/en.vtt",
      expect.anything(),
    );
    expect(screen.getByTestId("annotation-item-vtt")).toBeInTheDocument();
  });
});
