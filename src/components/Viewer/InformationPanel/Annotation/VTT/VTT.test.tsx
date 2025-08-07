import { render, screen } from "@testing-library/react";

import AnnotationItemVTT from "./VTT";
import { I18NextTestingProvider } from "src/lib/testing-helpers/i18n";
import Menu from "src/components/Viewer/InformationPanel/Menu";
import React from "react";

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
      headers: {
        "Content-Type": "text/plain",
        Accept: "application/json",
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
