import { describe, expect, it, vi } from "vitest";
import { encodeContentState } from "@iiif/helpers";

import {
  iiifContentError,
  pushIiifContent,
  validIiifContent,
} from "docs/lib/iiif-content";

const manifest =
  "https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json";

const contentState = encodeContentState(
  JSON.stringify({
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: "https://example.org/state/1",
    type: "Annotation",
    motivation: ["contentState"],
    target: {
      id: "https://example.org/canvas/1",
      type: "Canvas",
      partOf: [{ id: "https://example.org/manifest", type: "Manifest" }],
    },
  }),
);

describe("validIiifContent", () => {
  it("accepts an http(s) URL", () => {
    expect(validIiifContent(manifest)).toBe(manifest);
    expect(validIiifContent("http://localhost:3000/manifest.json")).toBe(
      "http://localhost:3000/manifest.json",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(validIiifContent(`  ${manifest}\n`)).toBe(manifest);
  });

  it("accepts an encoded IIIF Content State", () => {
    expect(validIiifContent(contentState)).toBe(contentState);
  });

  it.each([
    ["nothing", undefined],
    ["a list of values", [manifest]],
    ["an empty string", ""],
    ["whitespace", "   "],
    ["plain text", "not a url"],
    ["a single word", "hello"],
    ["a relative path", "/fixtures/manifest.json"],
    ["a javascript: URL", "javascript:alert(1)"],
    ["a data: URL", "data:application/json,{}"],
    ["an ftp: URL", "ftp://example.org/manifest.json"],
    ["a URL without a host", "https://"],
    ["encoded text that is not JSON", encodeContentState("not json")],
    ["an encoded JSON string, not an object", encodeContentState('"text"')],
  ])("rejects %s", (_label, value) => {
    expect(validIiifContent(value)).toBeUndefined();
  });
});

describe("iiifContentError", () => {
  it("is silent for a loadable value and explains an unloadable one", () => {
    expect(iiifContentError(manifest)).toBeUndefined();
    expect(iiifContentError("not a url")).toMatch(/Manifest or Collection/);
  });
});

describe("pushIiifContent", () => {
  const routerWith = (query: Record<string, string>) => ({
    pathname: "/docs/viewer/demo",
    query,
    push: vi.fn(),
  });

  it("sets the parameter and keeps the others, without data loading or scrolling", () => {
    const router = routerWith({ tab: "a", "iiif-content": "old" });
    pushIiifContent(router as any, manifest);
    expect(router.push).toHaveBeenCalledWith(
      {
        pathname: "/docs/viewer/demo",
        query: { tab: "a", "iiif-content": manifest },
      },
      undefined,
      { shallow: true, scroll: false },
    );
  });

  it("removes only the parameter when given no value", () => {
    const router = routerWith({ tab: "a", "iiif-content": manifest });
    pushIiifContent(router as any);
    expect(router.push).toHaveBeenCalledWith(
      { pathname: "/docs/viewer/demo", query: { tab: "a" } },
      undefined,
      { shallow: true, scroll: false },
    );
  });
});
