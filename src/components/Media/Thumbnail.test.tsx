import React from "react";
import Thumbnail from "./Thumbnail";
import { screen, render } from "@testing-library/react";
import { ThumbnailProps } from "./Thumbnail";
import { Group } from "./Media.styled";

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
    homepage: null,
    logo: [],
    partOf: [],
    rendering: [],
    service: [],
    duration: 0,
    height: 480,
    width: 640,
  },
  isActive: true,
  thumbnail: {
    id: "https://iiif.stack.rdc-staging.library.northwestern.edu/iiif/2/posters/20ed0982-2535-4dd9-8481-44ebeee5a161/full/!300,300/0/default.jpg",
    format: "image/jpeg",
    type: "Image",
    width: 200,
    height: 200,
  },
  handleChange: jest.fn(),
};

describe("MediaItem component", () => {
  it("renders", () => {
    render(
      <Group>
        <Thumbnail {...props} />
      </Group>,
    );
    const thumbnail = screen.getByTestId("media-thumbnail");
    expect(thumbnail);
    expect(thumbnail.hasAttribute("aria-checked")).toBe(true);
  });
});
