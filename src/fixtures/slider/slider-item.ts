import { type SliderItem } from "src/types/slider";

export const sliderItem = {
  id: "https://api.dc.library.northwestern.edu/api/v2/works/ecbde10a-be8f-4226-b236-d1436dd92647?as=iiif",
  type: "Manifest",
  homepage: [
    {
      id: "https://dc.library.northwestern.edu/items/ecbde10a-be8f-4226-b236-d1436dd92647",
      type: "Text",
      format: "text/html",
      label: {
        none: ["Prentice women's hospital and maternity center. Exterior"],
      },
    },
  ],
  label: {
    none: ["Ima label"],
  },
  summary: {
    none: ["Image"],
  },
  thumbnail: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/ecbde10a-be8f-4226-b236-d1436dd92647/thumbnail",
      format: "image/jpeg",
      type: "Image",
      width: 400,
      height: 400,
    },
  ],
} as SliderItem;
