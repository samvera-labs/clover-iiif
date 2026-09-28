import { render, screen } from "@testing-library/react";

import AnnotationItemVTT from "./VTT";
import { I18NextTestingProvider } from "src/lib/testing-helpers/i18n";
import Menu from "src/components/Viewer/InformationPanel/Menu";
import React from "react";
import * as viewerContext from "src/context/viewer-context";
import userEvent from "@testing-library/user-event";

vi.mock("src/components/Viewer/InformationPanel/Menu");
vi.mocked(Menu).mockReturnValue(<div>Menu Component</div>);

const props = {
  label: {
    en: ["Captions in WebVTT format"],
  },
  vttUri: "https://example.com/image.jpg",
};

describe("AnnotationItemVTT", () => {
  it("should render the component and aria-label caption", () => {
    render(
      <I18NextTestingProvider>
        <AnnotationItemVTT {...props} />
      </I18NextTestingProvider>,
    );
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
      <I18NextTestingProvider>
        <AnnotationItemVTT {...props} captionResources={captionResources} />
      </I18NextTestingProvider>,
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

  it("offers a button per language, labelled in that language", () => {
    renderWithState();
    expect(
      screen.getByTestId("annotation-item-vtt-tracks"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Captions in WebVTT format" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sottotitoli in formato WebVTT" }),
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
    expect(
      screen.getByRole("button", { name: "Sottotitoli in formato WebVTT" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("publishes its own choice for the player to follow", async () => {
    const { dispatch } = renderWithState();
    await userEvent.click(
      screen.getByRole("button", { name: "Sottotitoli in formato WebVTT" }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "updateActiveCaptionSrc",
      activeCaptionSrc: "https://example.org/it.vtt",
    });
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
