/**
 * `info.json` documents for the IIIF Image API tests.
 *
 * The three Göttingen documents are the reference server's, verbatim: the image the IIIF
 * Cookbook's 0005-image-service recipe paints, served once per API version.
 *
 * @see https://iiif.io/api/cookbook/recipe/0005-image-service/
 */

export const GOTTINGEN_V3 = {
  "@context": "http://iiif.io/api/image/3/context.json",
  extraFormats: ["jpg", "png"],
  extraQualities: ["default", "color", "gray"],
  height: 3024,
  id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen",
  profile: "level1",
  protocol: "http://iiif.io/api/image",
  tiles: [
    {
      height: 512,
      scaleFactors: [1, 2, 4],
      width: 512,
    },
  ],
  type: "ImageService3",
  width: 4032,
};

export const GOTTINGEN_V2_1 = {
  "@context": "http://iiif.io/api/image/2/context.json",
  "@id":
    "https://iiif.io/api/image/2.1/example/reference/918ecd18c2592080851777620de9bcb5-gottingen",
  height: 3024,
  profile: [
    "http://iiif.io/api/image/2/level1.json",
    {
      formats: ["jpg", "png"],
      qualities: ["default", "color", "gray"],
    },
  ],
  protocol: "http://iiif.io/api/image",
  tiles: [
    {
      height: 512,
      scaleFactors: [1, 2, 4],
      width: 512,
    },
  ],
  width: 4032,
};

export const GOTTINGEN_V2_0 = {
  "@context": "http://iiif.io/api/image/2/context.json",
  "@id":
    "https://iiif.io/api/image/2.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen",
  height: 3024,
  profile: [
    "http://iiif.io/api/image/2/level1.json",
    {
      formats: ["jpg", "png"],
      qualities: ["default", "color", "gray"],
    },
  ],
  protocol: "http://iiif.io/api/image",
  tiles: [
    {
      height: 512,
      scaleFactors: [1, 2, 4],
      width: 512,
    },
  ],
  width: 4032,
};

/** Cookbook recipe 0005: a Canvas painted with one image that has a level 1 service. */
export const RECIPE_0005_MANIFEST = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://iiif.io/api/cookbook/recipe/0005-image-service/manifest.json",
  type: "Manifest",
  label: {
    en: ["Picture of Göttingen taken during the 2019 IIIF Conference"],
  },
  items: [
    {
      id: "https://iiif.io/api/cookbook/recipe/0005-image-service/canvas/p1",
      type: "Canvas",
      label: {
        en: ["Canvas with a single IIIF image"],
      },
      height: 3024,
      width: 4032,
      items: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0005-image-service/page/p1/1",
          type: "AnnotationPage",
          items: [
            {
              id: "https://iiif.io/api/cookbook/recipe/0005-image-service/annotation/p0001-image",
              type: "Annotation",
              motivation: "painting",
              body: {
                id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg",
                type: "Image",
                format: "image/jpeg",
                height: 3024,
                width: 4032,
                service: [
                  {
                    id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen",
                    profile: "level1",
                    type: "ImageService3",
                  },
                ],
              },
              target:
                "https://iiif.io/api/cookbook/recipe/0005-image-service/canvas/p1",
            },
          ],
        },
      ],
    },
  ],
};

/** A level 0 static tree that lists sizes but no tiles (Image API 3). */
export const LEVEL0_SIZES_ONLY = {
  "@context": "http://iiif.io/api/image/3/context.json",
  id: "https://example.org/iiif/static",
  type: "ImageService3",
  protocol: "http://iiif.io/api/image",
  profile: "level0",
  width: 6000,
  height: 4000,
  sizes: [
    { width: 375, height: 250 },
    { width: 750, height: 500 },
    { width: 1500, height: 1000 },
  ],
};

/** A level 2 service that lists no tiles, so Clover cuts its own (Image API 2). */
export const LEVEL2_UNTILED_V2 = {
  "@context": "http://iiif.io/api/image/2/context.json",
  "@id": "https://example.org/iiif/2/untiled/",
  protocol: "http://iiif.io/api/image",
  profile: [
    "http://iiif.io/api/image/2/level2.json",
    { formats: ["jpg", "png"], maxWidth: 3000 },
  ],
  width: 2500,
  height: 1200,
};
