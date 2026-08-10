import defaultOpenSeadragonConfiguration from "./defaults";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("defaultOpenSeadragonConfiguration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("leaves OSD's default animation timing alone when motion is not reduced", () => {
    mockMatchMedia(false);
    const config = defaultOpenSeadragonConfiguration("test");
    expect(config.animationTime).toBeUndefined();
  });

  it("disables animation when the user prefers reduced motion", () => {
    mockMatchMedia(true);
    const config = defaultOpenSeadragonConfiguration("test");
    expect(config.animationTime).toBe(0);
  });
});
