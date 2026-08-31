import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { fireEvent, render, screen } from "@testing-library/react";

import ContentSearchForm from "src/components/Viewer/InformationPanel/ContentSearch/ContentSearchForm";
import Header from "src/components/Slider/Header/Header";
import React from "react";
import { Vault } from "@iiif/helpers/vault";
import { vi } from "vitest";

/**
 * The Slider's filter and the Viewer's content search are one search UI.
 *
 * Asserted through the shared class each renders rather than by eye: if the two ever drift
 * back into separate components, they stop carrying it and these fail. The content search
 * version used to pin its placeholder to a hardcoded `#0006`, which was invisible on a dark
 * theme, and its button kept an accent fill and a drop shadow long after the rest of the
 * library dropped both.
 *
 * This used to compare Stitches' generated hashes on both elements. The stable class is a
 * better subject: it is the name the stylesheet actually keys on and the one a consumer can
 * target, where the hash was an implementation detail that happened to be comparable.
 */

describe("shared search UI", () => {
  const renderSliderFilter = () => {
    const { container } = render(
      <Header
        label={{ none: ["Label"] }}
        summary={{ none: ["Summary"] }}
        search
        onSearch={vi.fn()}
      />,
    );
    // The field only exists once filtering is open, and opening it is a state change —
    // so it needs a React event, not a bare DOM click.
    fireEvent.click(screen.getByLabelText(/search/i));
    return container;
  };

  const renderContentSearch = () =>
    render(
      <ViewerProvider initialState={{ ...defaultState, vault: new Vault() }}>
        <ContentSearchForm
          activeCanvas="https://example.org/canvas/1"
          searchServiceUrl="https://example.org/search"
          setContentSearchResource={vi.fn()}
          setLoading={vi.fn()}
        />
      </ViewerProvider>,
    ).container;

  it("renders the same input in both places", () => {
    renderSliderFilter();
    const sliderInput = document.querySelector(".clover-slider-search-input");
    expect(sliderInput).toHaveClass("clover-search-input");

    document.body.innerHTML = "";
    renderContentSearch();
    const panelInput = document.querySelector(".content-search-input input");
    expect(panelInput).toHaveClass("clover-search-input");
  });

  it("renders the same control button in both places", () => {
    renderSliderFilter();
    expect(document.querySelector(".clover-slider-search")).toHaveClass(
      "clover-control",
    );

    document.body.innerHTML = "";
    renderContentSearch();
    expect(document.querySelector(".clover-search-submit")).toHaveClass(
      "clover-control",
    );
  });

  /*
   * The host's own class has to survive alongside the shared one. Both components merge
   * `className` rather than replacing it, and a host that lost its class would still look
   * right while breaking every consumer selector and the queries above.
   */
  it("keeps the host class alongside the shared one", () => {
    renderSliderFilter();
    const input = document.querySelector(".clover-search-input");
    expect(input).toHaveClass("clover-slider-search-input");

    const button = document.querySelector(".clover-slider-search");
    expect(button).toHaveClass("clover-control", "clover-slider-search");
  });
});
