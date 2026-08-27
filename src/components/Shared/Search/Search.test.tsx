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
 * Asserted through the generated class names rather than by eye: if the two ever drift back
 * into separate styled components, they stop matching here. The content search version used
 * to pin its placeholder to a hardcoded `#0006`, which was invisible on a dark theme, and its
 * button kept an accent fill and a drop shadow long after the rest of the library dropped
 * both.
 */
const stitchesClass = (el: Element | null) =>
  el?.className.toString().match(/c-\w+/)?.[0];

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
    expect(sliderInput).not.toBeNull();
    const sliderClass = stitchesClass(sliderInput);

    document.body.innerHTML = "";
    renderContentSearch();
    const panelInput = document.querySelector(".content-search-input input");
    expect(panelInput).not.toBeNull();

    expect(stitchesClass(panelInput)).toBe(sliderClass);
  });

  it("renders the same control button in both places", () => {
    renderSliderFilter();
    const sliderButton = document.querySelector(".clover-slider-search");
    const sliderClass = stitchesClass(sliderButton);
    expect(sliderClass).toBeTruthy();

    document.body.innerHTML = "";
    renderContentSearch();
    const submit = document.querySelector(".clover-search-submit");
    expect(submit).not.toBeNull();

    expect(stitchesClass(submit)).toBe(sliderClass);
  });
});
