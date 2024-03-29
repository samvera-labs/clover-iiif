import { render, screen } from "@testing-library/react";

import { CanvasNormalized } from "@iiif/presentation-3";
import Caption from "src/components/Scroll/Figure/Caption";
import React from "react";

// @ts-ignore
const canvas: CanvasNormalized = {
  label: {
    en: ["Label content for canvas"],
  },
  summary: {
    en: ["Summary content for canvas"],
  },
};

const canvasInfo = {
  current: 1,
  total: 4,
};

describe("Caption", () => {
  it("should render correctly", () => {
    render(<Caption canvas={canvas} canvasInfo={canvasInfo} />);

    expect(screen.getByText("1 / 4")).toBeInTheDocument();
    expect(screen.getByText("Label content for canvas")).toBeInTheDocument();
    expect(screen.getByText("Summary content for canvas")).toBeInTheDocument();
  });
});
