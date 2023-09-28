import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { Group } from "src/components/Viewer/Media/Media.styled";
import React from "react";
import Thumbnail from "src/components/Viewer/Media/Thumbnail";
import { ThumbnailProps } from "src/components/Viewer/Media/Thumbnail";

const props: ThumbnailProps = {
  canvas: {
    id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/bc/70/b8/02/-e/0c/7-/46/96/-a/bb/4-/41/c9/7e/48/cf/26-manifest.json/canvas/20ed0982-2535-4dd9-8481-44ebeee5a161",
    type: "Canvas",
    label: {
      en: ["Big Buck Bunny"],
    },
    behavior: [],
    motivation: null,
    thumbnail: [
      {
        id: "https://iiif.stack.rdc-staging.library.northwestern.edu/iiif/2/posters/20ed0982-2535-4dd9-8481-44ebeee5a161/full/!300,300/0/default.jpg",
        type: "ContentResource",
      },
    ],
    posterCanvas: null,
    accompanyingCanvas: null,
    placeholderCanvas: null,
    summary: null,
    requiredStatement: null,
    metadata: [],
    rights: null,
    navDate: null,
    provider: [],
    items: [
      {
        id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/bc/70/b8/02/-e/0c/7-/46/96/-a/bb/4-/41/c9/7e/48/cf/26-manifest.json/canvas/20ed0982-2535-4dd9-8481-44ebeee5a161/annotation_page/1",
        type: "AnnotationPage",
      },
    ],
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
  thumbnail: {
    id: "https://iiif.stack.rdc-staging.library.northwestern.edu/iiif/2/posters/20ed0982-2535-4dd9-8481-44ebeee5a161/full/!300,300/0/default.jpg",
    format: "image/jpeg",
    type: "Image",
    width: 200,
    height: 200,
  },
  type: "Image",
  handleChange: vi.fn(),
};

describe("Thumbnail component", () => {
  describe("image type", () => {
    beforeEach(() => {
      render(
        <Group>
          <Thumbnail {...props} />
        </Group>,
      );
    });

    it("renders", () => {
      const thumbnail = screen.getByTestId("media-thumbnail");
      expect(thumbnail);
      expect(thumbnail.hasAttribute("aria-checked")).toBe(true);
    });

    it("renders the proper label", () => {
      expect(screen.getByTestId("fig-caption")).toHaveTextContent(
        "Big Buck Bunny",
      );
    });

    it("displays a thumbnail image element as expected", () => {
      const img = screen.getByAltText("Big Buck Bunny");
      expect(img.tagName).toEqual("IMG");
    });

    it("renders a tag on the thumbnail", () => {
      expect(screen.getByTestId("thumbnail-tag"));
    });
  });

  describe("audio and video thumbnail types", () => {
    it("renders a duration value in the tag for audio type", () => {
      const newProps = { ...props, type: "Sound" };
      render(
        <Group>
          <Thumbnail {...newProps} />
        </Group>,
      );
      const tag = screen.getByTestId("thumbnail-tag");
      expect(within(tag).getByText("0:00"));
    });

    it("renders a duration value in the tag for video type", () => {
      const newProps = { ...props, type: "Video" };
      render(
        <Group>
          <Thumbnail {...newProps} />
        </Group>,
      );
      const tag = screen.getByTestId("thumbnail-tag");
      expect(within(tag).getByText("0:00"));
    });
  });
});
