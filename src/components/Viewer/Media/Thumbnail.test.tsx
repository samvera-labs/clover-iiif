// @ts-nocheck
import { waitFor, act, fireEvent } from "@testing-library/react";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import React, { createContext } from "react";
import { StyledSequence } from "src/components/Viewer/Media/Media.styled";
import { StyledSequenceGroup } from "src/components/Viewer/Media/Media.styled";
import { Item } from "./Thumbnail.styled";
import Thumbnail from "src/components/Viewer/Media/Thumbnail";
import { ThumbnailProps } from "src/components/Viewer/Media/Thumbnail";
import { getThumbnail } from "@iiif/helpers/thumbnail";
import { debug } from "console";

// const MockStyledSequenceContext = createContext();
// const mockSelectedThumbnail = 'default'
// const mockOnChange = jest.fn()

// const MockRadioGroupProvider = ({ children }) => (
//   <StyledSequence></StyledSequence>
// );

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
  return act(() => {
    return {
      //     __esModule: true,
      default: ({ children, isVisibleCallback, attributes }: any) => {
        isVisibleCallback(true);
        return <div {...attributes}>{children}</div>;
      },
    };
  });
});

// vi.mock("src/components/Viewer/Media/Media.styled"),
//   () => {
//     return {
//       __esModule: true,
//       default: ({ children, isVisibleCallback }: any) => {
//         act(() => {
//           isVisibleCallback(true);
//         });
//         return { children };
//       },
//     };
//   };

// vi.mock("./Thumbnail.styled"),
//   () => {
//     return {
//       default: ({ children, isVisible }: any) => {
//         act(() => {
//           isVisible(true);
//         });
//         return { children };
//       },
//     };
//   };

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
  describe("radiogroup", () => {
    test("renders", async () => {
      const a = render(
        <StyledSequence>
          <Thumbnail {...props} />
        </StyledSequence>,
      );

      debug(a);

      await act(async () => {
        fireEvent.click(screen.getByRole("radiogroup"));
      });
    });
  });

  describe("image type", () => {
    beforeEach(() => {
      // act(() => {
      // render(<StyledSequence />);
      // render(
      //   <StyledSequence>
      //     <Item />,
      //   </StyledSequence>,
      // );
      render(
        <StyledSequence>
          <Thumbnail {...props} />
        </StyledSequence>,
      );
      // });
    });

    it("renders", async () => {
      const thumbnail = await waitFor(() =>
        screen.getByTestId("media-thumbnail"),
      );
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
      // const lazy = await screen.findByTestId("media-thumbnail-lazyload");
      // expect(lazy).toBeInTheDocument();
      // debug(lazy);
      // expect(lazy).toHaveAttribute("data-lazyload", "true");
      // const img = await screen.findByTestId("media-thumbnail-image");
      // expect(img).toHaveAttribute(
      //   "src",
      //   "https://mocked-thumbnail.url/assets/thumbnail.jpg",
      // );
      // expect(img).toHaveAttribute("alt", "Mocked Label");
    });
  });

  describe("image thumbnails", () => {
    it("displays a thumbnail for canvas with designated thumbnail", async () => {
      const newProps = { ...props };
      await act(() => {
        render(
          <StyledSequence>
            <Thumbnail {...newProps} />
          </StyledSequence>,
        );
      });
      // const lazy = await screen.findByTestId("media-thumbnail-lazyload");
      // expect(lazy).toBeInTheDocument();
      // expect(lazy).toHaveAttribute("data-lazyload", "true");

      // const img = await screen.findByTestId("media-thumbnail-image");
      //     expect(img).toHaveAttribute(
      //       "src",
      //       "https://mocked-thumbnail.url/iiif/full/200,200/0/default.jpg",
      //     );
      //     expect(img).toHaveAttribute("alt", "Mocked Label");

      //     expect(getThumbnail).toHaveBeenCalled();
      //     expect(getThumbnail).toHaveBeenCalledWith(props.canvas, {
      //       vault: expect.anything(),
      //       dereference: true,
      //       width: 200,
      //       height: 200,
      //     });
    });
  });

  describe("figure missing a label", () => {
    it("renders a fallback label for item index + 1", async () => {
      const newProps = { ...props, canvas: { ...props.canvas, label: null } };
      await act(() => {
        render(
          <StyledSequence>
            <Thumbnail {...newProps} />
          </StyledSequence>,
        );
      });
      const fig = await screen.findByTestId("fig-caption");
      expect(fig).toHaveTextContent("2");
    });
  });

  describe("audio and video thumbnail types", () => {
    it("renders a duration value in the tag for audio type", async () => {
      render(
        <StyledSequence>
          <StyledSequenceGroup></StyledSequenceGroup>
        </StyledSequence>,
      );
      await act(async () => {
        const newProps = { ...props, type: "Sound" };
        render(
          <StyledSequence>
            <Thumbnail {...newProps} />
          </StyledSequence>,
        );
      });

      const tag = screen.getByTestId("thumbnail-tag");
      expect(within(tag).getByText("0:00")).toBeInTheDocument();
    });

    it("renders a duration value in the tag for video type", async () => {
      render(
        <StyledSequence>
          <StyledSequenceGroup />
        </StyledSequence>,
      );
      await act(() => {
        const newProps = { ...props, type: "Video" };
        render(
          <StyledSequence>
            <Thumbnail {...newProps} />,
          </StyledSequence>,
        );
      });
      await waitFor(() => {
        const tag = screen.getByTestId("thumbnail-tag");
        expect(within(tag).getByText("0:00")).toBeInTheDocument();
      });
    });
  });
});
