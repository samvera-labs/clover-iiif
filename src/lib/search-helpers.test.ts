import { getSearchResultSnippet } from "./search-helpers";

describe("getSearchResultSnippet()", () => {
  it("returns a string within a paragraph", () => {
    const content = "This is a test string for search result snippet";
    const searchString = "search";
    const stringLength = 15;
    const result = getSearchResultSnippet({
      searchString,
      content,
      stringLength,
    });
    expect(result).toBe("... string for search result ...");
  });

  it("returns a string at the start of a paragraph", () => {
    const content = "This is a test string for search result snippet";
    const searchString = "This";
    const stringLength = 10;
    const result = getSearchResultSnippet({
      searchString,
      content,
      stringLength,
    });
    expect(result).toBe("This is a ...");
  });

  it("returns a string if no searchString is set", () => {
    const content = "This is a test string for search result snippet";
    const stringLength = 10;
    const result = getSearchResultSnippet({
      content,
      stringLength,
    });
    expect(result).toBe("This ...");
  });

  it("returns a string if no searchString is found", () => {
    const content = "This is a test string for search result snippet";
    const searchString = "garbage";
    const stringLength = 10;
    const result = getSearchResultSnippet({
      searchString,
      content,
      stringLength,
    });
    expect(result).toBe("This is a ...");
  });
});
