import React from "react";
import { render } from "@testing-library/react";
import Label from "src/components/Primitives/Label/Label";

const internationalizedLabel = {
  none: ["the color of honey"],
  en: ["the colour of honey"],
  fr: ["la couleur du miel"],
};

const multipleValueLabel = {
  none: ["the", "color", "of", "honey"],
};

describe("label primitive", () => {
  /**
   * test internationalization and element assignment
   */
  it("Renders 3.0 label as an h1", async () => {
    const { getByRole } = render(
      <Label label={internationalizedLabel} as="h1" />
    );
    const el = getByRole("heading", { level: 1 });
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("the color of honey");
  });
  it("Renders 3.0 label as French value", async () => {
    const { getByText } = render(
      <Label label={internationalizedLabel} as="h1" lang="fr" />
    );
    const el = getByText("la couleur du miel");
    expect(el).toBeInTheDocument();
  });
  it("Renders 3.0 label as English value", async () => {
    const { getByText } = render(
      <Label label={internationalizedLabel} lang="en" />
    );
    const el = getByText("the colour of honey");
    expect(el).toBeInTheDocument();
  });

  /**
   * test multiple value join
   */
  it("Renders 3.0 label as comma separated string", async () => {
    const { getByRole } = render(<Label label={multipleValueLabel} as="h3" />);
    const el = getByRole("heading", { level: 3 });
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("the, color, of, honey");
  });

  /**
   * test multiple value join
   */
  it("Renders 3.0 label if set lang code does not exist", async () => {
    const { getByRole } = render(
      <Label label={multipleValueLabel} as="h5" lang="ja" />
    );
    const el = getByRole("heading", { level: 5 });
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("the, color, of, honey");
  });
});
