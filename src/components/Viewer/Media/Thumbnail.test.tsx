// @ts-nocheck

vi.mock("@iiif/helpers/thumbnail", async () => {
  return {
    getThumbnail: vi.fn().mockResolvedValue({
      best: {
        id: "https://mocked-thumbnail.url/iiif/full/200,200/0/default.jpg",
      },
    }),
  };
});

vi.mock("src/components/UI/LazyLoad/LazyLoad", () => {
  return {
    __esModule: true,
    default: ({ children, isVisibleCallback, attributes }: any) => {
      isVisibleCallback(true); // Simulate component becoming visible
      return <div {...attributes}>{children}</div>;
    },
  };
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import React from "react";
import { StyledSequence } from "src/components/Viewer/Media/Media.styled";
import Thumbnail from "src/components/Viewer/Media/Thumbnail";
import { ThumbnailProps } from "src/components/Viewer/Media/Thumbnail";
import { getThumbnail } from "@iiif/helpers/thumbnail";

const props: ThumbnailProps = {
  canvas: {
    id: "some-id",
    type: "Canvas",
    label: { en: ["Mocked Label"] },
    behavior: [],
    motivation: null,
    thumbnail: [],
    posterCanvas: null,
    accompanyingCanvas: null,
    placeholderCanvas: null,
    summary: null,
    requiredStatement: null,
    metadata: [],
    rights: null,
    navDate: null,
    provider: [],
    items: [],
    annotations: [],
    seeAlso: [],
    homepage: [],
    logo: [],
    partOf: [],
    rendering: [],
    service: [],
    duration: 0,
    height: 480,
    width: 640,
  },
  canvasIndex: 1,
  isActive: true,
  type: "Image",
  handleChange: vi.fn(),
};

describe("Thumbnail component", () => {
  describe("image type", () => {
    beforeEach(() => {
      render(
        <StyledSequence>
          <Thumbnail {...props} />
        </StyledSequence>,
      );
    });

    it("renders", () => {
      const thumbnail = screen.getByTestId("media-thumbnail");
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute("aria-checked", "true");
    });

    it("renders the proper label", () => {
      expect(screen.getByTestId("fig-caption")).toHaveTextContent(
        "Mocked Label",
      );
    });

    it("renders a tag on the thumbnail", () => {
      expect(screen.getByTestId("thumbnail-tag")).toBeInTheDocument();
    });
  });

  describe("image thumbnails", () => {
    it("displays a thumbnail for canvas with designated thumbnail", async () => {
      const newProps = {
        ...props,
        canvas: {
          ...props.canvas,
          thumbnail: [
            {
              id: "https://mocked-thumbnail.url/assets/thumbnail.jpg",
              type: "Image",
              format: "image/jpeg",
              width: 200,
              height: 200,
            },
          ],
        },
      };
      render(
        <StyledSequence>
          <Thumbnail {...newProps} />
        </StyledSequence>,
      );
      const lazy = await screen.findByTestId("media-thumbnail-lazyload");
      expect(lazy).toBeInTheDocument();
      expect(lazy).toHaveAttribute("data-lazyload", "true");

      const img = await screen.findByTestId("media-thumbnail-image");
      expect(img).toHaveAttribute(
        "src",
        "https://mocked-thumbnail.url/assets/thumbnail.jpg",
      );
      expect(img).toHaveAttribute("alt", "Mocked Label");
    });
  });

  describe("image thumbnails", () => {
    it("displays a thumbnail for canvas with designated thumbnail", async () => {
      const newProps = { ...props };
      render(
        <StyledSequence>
          <Thumbnail {...newProps} />
        </StyledSequence>,
      );
      const lazy = await screen.findByTestId("media-thumbnail-lazyload");
      expect(lazy).toBeInTheDocument();
      expect(lazy).toHaveAttribute("data-lazyload", "true");

      const img = await screen.findByTestId("media-thumbnail-image");
      expect(img).toHaveAttribute(
        "src",
        "https://mocked-thumbnail.url/iiif/full/200,200/0/default.jpg",
      );
      expect(img).toHaveAttribute("alt", "Mocked Label");

      expect(getThumbnail).toHaveBeenCalled();
      expect(getThumbnail).toHaveBeenCalledWith(props.canvas, {
        vault: expect.anything(),
        dereference: true,
        width: 200,
        height: 200,
      });
    });
  });

  describe("figure missing a label", () => {
    it("renders a fallback label for item index + 1", async () => {
      const newProps = { ...props, canvas: { ...props.canvas, label: null } };
      render(
        <StyledSequence>
          <Thumbnail {...newProps} />
        </StyledSequence>,
      );
      const fig = await screen.findByTestId("fig-caption");
      expect(fig).toHaveTextContent("2");
    });
  });

  describe("audio and video thumbnail types", () => {
    it("renders a duration value in the tag for audio type", () => {
      const newProps = { ...props, type: "Sound" };
      render(
        <StyledSequence>
          <Thumbnail {...newProps} />
        </StyledSequence>,
      );
      const tag = screen.getByTestId("thumbnail-tag");
      expect(within(tag).getByText("0:00")).toBeInTheDocument();
    });

    it("renders a duration value in the tag for video type", () => {
      const newProps = { ...props, type: "Video" };
      render(
        <StyledSequence>
          <Thumbnail {...newProps} />
        </StyledSequence>,
      );
      const tag = screen.getByTestId("thumbnail-tag");
      expect(within(tag).getByText("0:00")).toBeInTheDocument();
    });
  });
});
