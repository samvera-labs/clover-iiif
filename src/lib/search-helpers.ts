const getSearchResultSnippet = ({
  searchString = "",
  content,
  stringLength = 150,
}: {
  searchString?: string;
  content: string;
  stringLength?: number;
}) => {
  const index = content.toLowerCase().indexOf(searchString.toLowerCase());
  if (index !== -1) {
    // Try to find the start of the context slice without breaking words
    let start = Math.max(0, index - stringLength / 2);
    let end = Math.min(
      content.length,
      index + searchString.length + stringLength / 2,
    );

    if (start > 0) {
      const startSpaceIndex = content.lastIndexOf(" ", start + 1);
      start = startSpaceIndex > 0 ? startSpaceIndex + 1 : start;
    }
    if (end < content.length) {
      const endSpaceIndex = content.indexOf(" ", end - 1);
      end = endSpaceIndex > -1 ? endSpaceIndex : end;
    }

    content =
      (start > 0 ? "... " : "") +
      content.substring(start, end) +
      (end < content.length ? " ..." : "");
  } else {
    // If the searchString is not found, return the first stringLength characters without breaking words
    content = String(content.substring(0, stringLength) + "...");
  }

  return content;
};

export { getSearchResultSnippet };
