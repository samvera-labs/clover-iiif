# Text

A Manifest read as text, as Clover 3.x's Scroll reads it: one `article` per Canvas, its
image beside its annotations (transcriptions, translations, comments) in a column per
language. A search narrows the pages to those whose text matches; pressing an image opens
it in a lightbox to pan and zoom.

```jsx
import Viewer from "@nulib/clover";
import { Text } from "@nulib/clover/templates";
import "@nulib/clover/styles.css";
import "@nulib/clover/templates.css";

<Viewer iiifContent="https://example.org/manifest.json" template={Text} />;
```

| Prop     | Default | What it does                                       |
| -------- | ------- | -------------------------------------------------- |
| `search` | `true`  | The search field in the sticky header.             |
| …        |         | Every `Clover.Root` prop except `annotationPages`. |

Every Canvas's annotation pages are fetched at once (`annotationPages="all"`), since they
are all on the page. Markdown bodies (`text/markdown`) are read as Markdown; right-to-left
languages run right to left.

To change the layout, copy `Text.tsx`, `Text.css` and `../shared/Lightbox.tsx` into your
app. They use only what `@nulib/clover` exports.
