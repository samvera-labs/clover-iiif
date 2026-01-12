import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";

import Item from "./Item";
import {
  ScrollContext,
  initialState,
  type StateType,
} from "src/context/scroll-context";
import { scrollSingleCanvasLanguages } from "src/fixtures/scroll/manifest-single-language-columns";
import { Vault } from "@iiif/helpers/vault";
import { Reference } from "@iiif/presentation-3";

const canvas = scrollSingleCanvasLanguages.items[0];
const canvasReference = {
  id: canvas.id,
  type: "Canvas",
} as Reference<"Canvas">;

const buildAnnotations = () => {
  return (canvas.annotations || []).flatMap((page) => {
    const items = page?.items || [];

    return items.map((annotation) => ({
      ...annotation,
      body: Array.isArray(annotation.body)
        ? (annotation.body as any[])
        : [annotation.body],
      target: {
        type: "SpecificResource",
        source: {
          id: canvas.id,
          type: "Canvas",
        },
      },
    }));
  });
};

const vault = new Vault();

beforeAll(async () => {
  await vault.loadManifest(
    "https://example.org/iiif/manifest/language-columns",
    scrollSingleCanvasLanguages as any,
  );
});

const annotationFixtures = buildAnnotations();

const renderItem = (stateOverrides: Partial<StateType> = {}) => {
  const contextValue = {
    state: {
      ...initialState,
      annotations: annotationFixtures,
      vault,
      ...stateOverrides,
    },
    dispatch: vi.fn(),
  };

  return render(
    <ScrollContext.Provider value={contextValue}>
      <Item
        hasItemBreak={false}
        isLastItem={false}
        item={canvasReference}
        itemCount={1}
        itemNumber={1}
      />
    </ScrollContext.Provider>,
  );
};

describe("ScrollItem language grouping", () => {
  it("renders both language columns when no filter is applied", () => {
    renderItem();

    const columns = screen.getByTestId("scroll-item-language-columns");
    expect(columns.childElementCount).toBe(2);

    const [englishColumn, frenchColumn] = Array.from(columns.children);
    expect(englishColumn).toHaveAttribute("lang", "en");
    expect(frenchColumn).toHaveAttribute("lang", "fr");
  });

  it("filters columns based on active languages", () => {
    renderItem({
      activeLanguages: ["en"],
    });

    const columns = screen.getByTestId("scroll-item-language-columns");
    expect(columns.childElementCount).toBe(1);
    expect(columns.firstElementChild).toHaveAttribute("lang", "en");
  });
});
