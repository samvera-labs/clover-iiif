export const tileSourceResponse = {
  "@context": "http://iiif.io/api/image/2/context.json",
  "@id":
    "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/567d7b42-53e0-4128-ba16-26e6d00d1b43",
  protocol: "http://iiif.io/api/image",
  width: 4167,
  height: 6155,
  sizes: [
    {
      width: 4167,
      height: 6155,
    },
    {
      width: 2083,
      height: 3077,
    },
    {
      width: 1041,
      height: 1538,
    },
    {
      width: 520,
      height: 769,
    },
    {
      width: 260,
      height: 384,
    },
    {
      width: 130,
      height: 192,
    },
    {
      width: 65,
      height: 96,
    },
  ],
  tiles: [
    {
      width: 512,
      height: 512,
      scaleFactors: [1, 2, 4, 8, 16, 32, 64],
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
  crossOriginPolicy: false,
  ajaxWithCredentials: false,
  useCanvas: true,
  version: 2,
  tileSizePerScaleFactor: {},
  tileWidth: 512,
  tileHeight: 512,
  maxLevel: 6,
};
