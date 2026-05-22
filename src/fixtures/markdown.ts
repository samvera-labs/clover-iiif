/**
 * Sample markdown bodies covering the formatting features Clover renders for
 * IIIF annotations declared with `format: "text/markdown"`. Used by the
 * useMarkdown hook tests and any downstream tests that need realistic
 * markdown input.
 */

export const markdownInline = "**Hello** _world_";

export const markdownHeadings = `# Manuscript Page 1

## Transcription

Lorem ipsum dolor sit amet.`;

export const markdownLists = `Items pictured:

- A horse
- A rider
- A crowd

Sequence:

1. Approach
2. Race
3. Crowd cheers`;

export const markdownLink =
  "See [the IIIF Cookbook](https://iiif.io/api/cookbook/) for examples.";

export const markdownGfm = `Notes about a transcription run:

| Page | Status        | Notes |
| ---- | ------------- | ----- |
| 1    | complete      | clean copy |
| 2    | ~~partial~~   | needs review |`;

export const markdownRawHtml = `Annotation body that mixes Markdown and HTML, as appears in some IIIF
manifests:

This page references <a href="https://example.org/source">an external
source</a>; see also <em>page 14</em> of the catalogue.`;

export const markdownAnnotationBody = `## Transcription

> "The few extremely small villages perched high on the mountain side
> or lying in some pretty, retired bay…"

— *Travel Notes*, 1934. See [more](https://example.org/notes).`;

export const markdownFootnotes = `Manuscript text with a scholarly annotation.[^1] A second reference appears here.[^2]

[^1]: Jones, *Catalogue of Manuscripts*, p. 42.
[^2]: See also the description in volume II.`;

export const allMarkdownFixtures = {
  markdownInline,
  markdownHeadings,
  markdownLists,
  markdownLink,
  markdownGfm,
  markdownRawHtml,
  markdownAnnotationBody,
  markdownFootnotes,
};
