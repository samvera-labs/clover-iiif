import NavigatorTab from "./NavigatorTab";
import React from "react";
import { render, screen } from "@testing-library/react";

describe("Navigator tab component", () => {
  it("renders", () => {
    render(
      <NavigatorTab
        resource={{
          id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/supplementing/new_airliner_en.vtt",
          type: "Text",
          format: "text/vtt",
          label: {
            en: ["en"],
          },
          language: "en",
        }}
        active={true}
        handleChange={(): void => {}}
      />,
    );
    expect(screen.getByTestId("navigator-tab"));
  });
});
