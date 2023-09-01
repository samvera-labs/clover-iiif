import { getResourceType } from "./getResourceType";

describe("getResourceType()", () => {
  test("should return the resource type", () => {
    const annotation = {
      body: {
        type: "Image",
      },
    };
    const result = getResourceType(annotation);
    expect(result).toEqual("Image");
  });

  test("should default to Image if there is no body", () => {
    const annotation = {};
    const result = getResourceType(annotation);
    expect(result).toEqual("Image");
  });
});
