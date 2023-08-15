export const tileSourceResponse = {
  "@context": "http://iiif.io/api/image/2/context.json",
  "@id":
    "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/180682c9-dfaf-4881-b7b6-1f2f21092d4f",
  protocol: "http://iiif.io/api/image",
  width: 3780,
  height: 4440,
  sizes: [
    {
      width: 3780,
      height: 4440,
    },
    {
      width: 1890,
      height: 2220,
    },
    {
      width: 945,
      height: 1110,
    },
    {
      width: 472,
      height: 555,
    },
    {
      width: 236,
      height: 277,
    },
    {
      width: 118,
      height: 138,
    },
  ],
  tiles: [
    {
      width: 512,
      height: 512,
      scaleFactors: [1, 2, 4, 8, 16, 32],
    },
  ],
  profile: [
    "http://iiif.io/api/image/2/level2.json",
    {
      formats: ["jpg", "jpeg", "tif", "tiff", "png", "webp"],
      qualities: ["color", "gray", "bitonal", "default"],
      supports: [
        "regionByPx",
        "sizeByW",
        "sizeByWhListed",
        "cors",
        "regionSquare",
        "sizeByDistortedWh",
        "sizeAboveFull",
        "canonicalLinkHeader",
        "sizeByConfinedWh",
        "sizeByPct",
        "jsonldMediaType",
        "regionByPct",
        "rotationArbitrary",
        "sizeByH",
        "baseUriRedirect",
        "rotationBy90s",
        "profileLinkHeader",
        "sizeByForcedWh",
        "sizeByWh",
        "mirroring",
      ],
    },
  ],
};
