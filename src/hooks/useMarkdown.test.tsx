import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useMarkdown from "./useMarkdown";

describe("useMarkdown", () => {
  it("converts markdown into html", async () => {
    const { result } = renderHook(() => useMarkdown("**Hello** _world_"));

    await waitFor(() => {
      expect(result.current.html).toContain("<strong>Hello</strong>");
      expect(result.current.html).toContain("<em>world</em>");
    });
  });
});
