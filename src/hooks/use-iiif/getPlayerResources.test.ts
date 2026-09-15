import { Vault } from "@iiif/helpers/vault";
import captionManifest from "src/fixtures/iiif-cookbook/0219-using-caption-file.json";
import multiLanguageManifest from "src/fixtures/iiif-cookbook/0074-multiple-language-captions.json";
import { getAnnotationResources } from "src/hooks/use-iiif/getAnnotationResources";
import {
  getPlayerCaptions,
  getPlayerChapters,
  getPlayerResources,
  getPlayerSources,
} from "src/hooks/use-iiif/getPlayerResources";

const CANVAS =
  "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas";
const MANIFEST =
  "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/manifest.json";

/**
 * `vault.loadManifest` normalizes in place, mutating the object it is given. The fixture is
 * an imported module singleton, so handing it over directly poisons it for every later test
 * in the file — the canvas comes back with `duration: 0` on the second load. Clone first.
 */
async function loadCaptionVault() {
  const vault = new Vault();
  await vault.loadManifest("", structuredClone(captionManifest) as any);
  return vault;
}

/**
 * A Manifest with `structures` whose Range items carry time fragments — the shape that makes
 * a Range a chapter rather than just a table-of-contents entry.
 */
function chapterManifest({
  spelling = "hash",
}: { spelling?: "hash" | "selector" } = {}) {
  const canvasId = "https://example.org/canvas/1";

  const target = (t: string) =>
    spelling === "hash"
      ? `${canvasId}#t=${t}`
      : {
          type: "SpecificResource",
          source: { id: canvasId, type: "Canvas" },
          selector: { type: "FragmentSelector", value: `t=${t}` },
        };

  return {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: "https://example.org/manifest",
    type: "Manifest",
    label: { en: ["Chaptered"] },
    items: [
      {
        id: canvasId,
        type: "Canvas",
        duration: 300,
        height: 360,
        width: 640,
        items: [
          {
            id: `${canvasId}/page`,
            type: "AnnotationPage",
            items: [
              {
                id: `${canvasId}/page/a1`,
                type: "Annotation",
                motivation: "painting",
                target: canvasId,
                body: {
                  id: "https://example.org/media/video.mp4",
                  type: "Video",
                  format: "video/mp4",
                  duration: 300,
                },
              },
            ],
          },
        ],
      },
    ],
    structures: [
      {
        id: "https://example.org/range/1",
        type: "Range",
        label: { en: ["Introduction"] },
        items: [target("0,30")],
      },
      {
        id: "https://example.org/range/2",
        type: "Range",
        label: { en: ["Interview begins"] },
        items: [target("30,180")],
      },
      {
        id: "https://example.org/range/3",
        type: "Range",
        label: { en: ["Closing"] },
        // Start only — the gap-closing logic should give this an end.
        items: [target("180")],
      },
    ],
  };
}

describe("getPlayerCaptions()", () => {
  test("returns a VTT supplementing body with its IIIF label and declared language", async () => {
    const vault = await loadCaptionVault();
    const annotationResources = await getAnnotationResources(vault, CANVAS);

    const captions = getPlayerCaptions(vault, annotationResources);

    expect(captions).toHaveLength(1);
    expect(captions[0]).toEqual({
      src: "https://fixtures.iiif.io/video/indiana/lunchroom_manners/lunchroom_manners.vtt",
      label: "Captions in WebVTT format",
      language: "en",
      default: true,
    });
  });

  test("honors ignoreCaptionLabels", async () => {
    const vault = await loadCaptionVault();
    const annotationResources = await getAnnotationResources(vault, CANVAS);

    const captions = getPlayerCaptions(vault, annotationResources, [
      "Captions in WebVTT format",
    ]);

    expect(captions).toEqual([]);
  });

  /**
   * Cookbook 0074 wraps one caption per language in a `Choice`. The Vault mints a
   * `vault://<hash>` id for that Choice, which `isCaptionResource` rejects — so before the
   * collector opened Choices, this manifest produced no captions at all on either path.
   *
   * @see https://iiif.io/api/cookbook/recipe/0074-multiple-language-captions/
   */
  test("opens a Choice and keeps one caption per language", async () => {
    const vault = new Vault();
    await vault.loadManifest("", structuredClone(multiLanguageManifest) as any);
    const annotationResources = await getAnnotationResources(
      vault,
      "https://iiif.io/api/cookbook/recipe/0074-multiple-language-captions/canvas",
    );

    const captions = getPlayerCaptions(vault, annotationResources);

    expect(captions).toEqual([
      {
        src: "https://iiif.io/api/cookbook/recipe/0074-multiple-language-captions/Per_voi_signore_Modelli_francesi_en.vtt",
        label: "Captions in WebVTT format",
        language: "en",
        default: true,
      },
      {
        // Labelled only in Italian, so `getLabel` falls back to the language that is there.
        src: "https://iiif.io/api/cookbook/recipe/0074-multiple-language-captions/Per_voi_signore_Modelli_francesi_it.vtt",
        label: "Sottotitoli in formato WebVTT",
        language: "it",
        default: false,
      },
    ]);
  });

  test("returns an empty list when there are no annotations", async () => {
    const vault = await loadCaptionVault();
    expect(getPlayerCaptions(vault, [])).toEqual([]);
  });
});

describe("getPlayerChapters()", () => {
  test.each(["hash", "selector"] as const)(
    "builds chapters from structures using the %s time fragment spelling",
    async (spelling) => {
      const vault = new Vault();
      await vault.loadManifest("", chapterManifest({ spelling }) as any);

      const chapters = getPlayerChapters(
        vault,
        "https://example.org/manifest",
        "https://example.org/canvas/1",
        300,
      );

      expect(chapters).toEqual([
        { startTime: 0, endTime: 30, text: "Introduction" },
        { startTime: 30, endTime: 180, text: "Interview begins" },
        // End supplied from the canvas duration, since this Range declared only a start.
        { startTime: 180, endTime: 300, text: "Closing" },
      ]);
    },
  );

  test("returns an empty list for a Manifest with no structures", async () => {
    const vault = await loadCaptionVault();
    expect(getPlayerChapters(vault, MANIFEST, CANVAS)).toEqual([]);
  });

  test("ignores Ranges that target a different canvas", async () => {
    const vault = new Vault();
    await vault.loadManifest("", chapterManifest() as any);

    expect(
      getPlayerChapters(
        vault,
        "https://example.org/manifest",
        "https://example.org/canvas/does-not-exist",
      ),
    ).toEqual([]);
  });
});

describe("getPlayerSources()", () => {
  test("maps Choice bodies to labeled sources", () => {
    const sources = getPlayerSources([
      {
        id: "https://example.org/high.mp4",
        format: "video/mp4",
        label: { en: ["High"] },
      },
      { id: "https://example.org/low.mp4", format: "video/mp4" },
    ] as any);

    expect(sources).toEqual([
      { src: "https://example.org/high.mp4", type: "video/mp4", label: "High" },
      // No label of its own, so the format stands in.
      {
        src: "https://example.org/low.mp4",
        type: "video/mp4",
        label: "video/mp4",
      },
    ]);
  });

  test("drops bodies with no id", () => {
    expect(getPlayerSources([{ format: "video/mp4" }] as any)).toEqual([]);
  });
});

describe("getPlayerResources()", () => {
  test("reads duration from the canvas, not the media body", async () => {
    const vault = await loadCaptionVault();
    const annotationResources = await getAnnotationResources(vault, CANVAS);

    const resources = getPlayerResources(vault, {
      manifestId: MANIFEST,
      canvasId: CANVAS,
      annotationResources,
      allSources: [],
      ignoreCaptionLabels: [],
    });

    expect(resources.duration).toBe(572.034);
    expect(resources.captions).toHaveLength(1);
    expect(resources.chapters).toEqual([]);
  });
});
