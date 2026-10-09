import { act, renderHook } from "@testing-library/react";

/*
 * The translator is module state, as i18next's instance was. Each test gets a fresh copy
 * so a language set in one cannot leak into the next.
 */
async function load() {
  vi.resetModules();
  const config = await import("src/i18n/config");
  const hook = await import("src/i18n/useCloverTranslation");
  return { ...config, ...hook };
}

function preferLanguages(languages: string[]) {
  vi.spyOn(navigator, "languages", "get").mockReturnValue(languages);
  vi.spyOn(navigator, "language", "get").mockReturnValue(languages[0] ?? "");
}

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.lang = "";
});

describe("Clover i18n", () => {
  it("speaks English by default", async () => {
    preferLanguages([]);
    const { cloverI18n } = await load();
    expect(cloverI18n.t("imageViewerOpen")).toBe("Open image viewer");
    expect(cloverI18n.language).toBe("en");
  });

  it("interpolates values, and leaves a placeholder without one alone", async () => {
    preferLanguages([]);
    const { cloverI18n } = await load();
    expect(cloverI18n.t("canvasPosition", { index: 2, total: 4 })).toBe(
      "Item 2 of 4",
    );
    expect(cloverI18n.t("canvasPosition", { index: 2 })).toBe(
      "Item 2 of {{total}}",
    );
  });

  it("returns the key itself when nothing matches", async () => {
    const { cloverI18n } = await load();
    expect(cloverI18n.t("noSuchKey")).toBe("noSuchKey");
  });

  it("detects the reader's language from the browser", async () => {
    preferLanguages(["fr-CA", "en"]);
    const { cloverI18n } = await load();
    // fr-CA has no strings of its own; its base language does.
    expect(cloverI18n.language).toBe("fr");
    expect(cloverI18n.t("imageZoomIn")).not.toBe("Zoom in");
  });

  it("tries each preferred language before falling back to English", async () => {
    preferLanguages(["de-DE", "pt-BR"]);
    const { cloverI18n } = await load();
    expect(cloverI18n.language).toBe("pt");
  });

  it("uses the page's language when the browser offers none", async () => {
    preferLanguages([]);
    document.documentElement.lang = "es";
    const { cloverI18n } = await load();
    expect(cloverI18n.language).toBe("es");
  });

  it("takes an explicit lng and fallbackLng, as documented", async () => {
    preferLanguages(["en"]);
    const { cloverI18n, initCloverI18n } = await load();
    initCloverI18n({ lng: "nn", fallbackLng: ["nb", "no", "en"] });
    expect(cloverI18n.language).toBe("nn");
    expect(cloverI18n.t("imageViewerOpen")).toBe("Opne biletvisaren");
    // nn has no "imageZoomIn"; neither do nb or no, so English answers.
    expect(cloverI18n.t("imageZoomIn")).toBe("Zoom in");
  });

  it("bootstraps a language Clover does not ship, falling back key by key", async () => {
    preferLanguages(["en"]);
    const { cloverI18n, initCloverI18n } = await load();
    initCloverI18n({
      lng: "de",
      fallbackLng: ["de", "en"],
      resources: { de: { clover: { informationPanelTabsAbout: "Über" } } },
    });
    expect(cloverI18n.t("informationPanelTabsAbout")).toBe("Über");
    expect(cloverI18n.t("imageZoomIn")).toBe("Zoom in");
  });

  it("merges overrides into a shipped language on a later call", async () => {
    preferLanguages(["en"]);
    const { cloverI18n, initCloverI18n } = await load();
    initCloverI18n();
    initCloverI18n({
      resources: { en: { clover: { imageZoomIn: "Closer" } } },
    });
    expect(cloverI18n.t("imageZoomIn")).toBe("Closer");
    expect(cloverI18n.t("imageZoomOut")).toBe("Zoom out");
  });

  it("re-renders readers when the language changes", async () => {
    preferLanguages(["en"]);
    const { useCloverTranslation, initCloverI18n } = await load();
    initCloverI18n({
      resources: { de: { clover: { imageZoomIn: "Vergrößern" } } },
    });
    const { result } = renderHook(() => useCloverTranslation());
    expect(result.current.t("imageZoomIn")).toBe("Zoom in");

    act(() => {
      initCloverI18n({ lng: "de" });
    });
    expect(result.current.t("imageZoomIn")).toBe("Vergrößern");
  });
});
