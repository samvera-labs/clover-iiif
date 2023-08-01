import { render } from "@testing-library/react";
import { parseCustomContent } from "./custom";
import { customValueContent } from "../fixtures/custom";
import { ReactElement } from "react";

const label = { none: ["Subject"] };

describe("parseCustomContent", () => {
  it("Returns plucked matching Content ", () => {
    const customValueElement = parseCustomContent(label, customValueContent);

    /**
     * note that the value is "undefined as `props.value` has yet been
     * written to th ReactElement in components/Value/CustomValue
     */
    const { getByRole } = render(customValueElement as ReactElement);
    const el = getByRole("link");
    expect(el).toContainHTML(
      '<a href="https://example.org/?subject=undefined" />'
    );
  });
});
