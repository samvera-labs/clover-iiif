import { enableFetchMocks } from "jest-fetch-mock";
import React from "react";
import { render } from "@testing-library/react";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import { tileSourceResponse } from "@/services/iiif-test-fixtures";

enableFetchMocks();

describe("ImageViewer component", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("renders", () => {
    fetchMock.mockResponseOnce(JSON.stringify(tileSourceResponse));

    render(
      <ImageViewer
        body={{
          id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f/full/600,/0/default.jpg",
          type: "Image",
          format: "image/jpeg",
          service: [
            {
              id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f",
              profile: "http://iiif.io/api/image/2/level2.json",
              type: "ImageService2",
            },
          ],
          width: 3780,
          height: 4440,
        }}
        hasPlaceholder={false}
      />,
    );
  });
});
