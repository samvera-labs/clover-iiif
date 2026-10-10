# Classic

The layout of Clover 3.x's Viewer, built from 4.x parts: the title and a Share button
above; the stage with the information panel to its right; the thumbnail strip under the
stage, headed by the position and a pair of arrows. The panel closes from its own close
button or the toggle in the stage's controls. Below 48rem the panel stacks under the
strip.

```jsx
import { Classic } from "@nulib/clover/templates";
import "@nulib/clover/styles.css";
import "@nulib/clover/templates.css";

<Classic iiifContent="https://example.org/manifest.json" />;
```

| Prop               | Default | What it does                                                    |
| ------------------ | ------- | --------------------------------------------------------------- |
| `panel`            | `true`  | The information panel and its toggle.                           |
| `defaultPanelOpen` | `true`  | Whether the panel starts open.                                  |
| `share`            | `true`  | A Share button in the header.                                   |
| `filter`           | `false` | A filter field over the thumbnails.                             |
| …                  |         | Every `Clover.Root` prop: `request`, `canvasId`, `annotations`… |

Size the stage with `--clover-content-height` (default `min(65vh, 40rem)`).

To change the layout, copy `Classic.tsx` and `Classic.css` into your app. They use only
what `@nulib/clover` exports.
