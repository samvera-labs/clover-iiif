![image](https://user-images.githubusercontent.com/7376450/142292714-27616e2d-e7cf-42f7-9297-17853a948ca2.png)

# React Media Player

**An A/V media viewer driven by IIIF Presentation API built with React.js**

[**View Demo**](https://codesandbox.io/s/nulib-react-media-player-sample-i0huq)

React Media Player is a UI component that renders a multicanvas IIIF viewer intended for `Video` and `Sound` content resources with basic pan-zoom support for `Image` via OpenSeadragon. Provide a [IIIF Presentation](https://iiif.io/api/presentation/3.0/) manifest and the component:

- Renders a multi-canvas _Video_, _Sound_, and _Image_ viewer
- Renders thumbnails as navigation between canvases
- Renders annotations with the [motivation](https://iiif.io/api/presentation/3.0/#values-for-motivation) of `supplementing` with a content resource having the format of `text/vtt` for _Video_ and _Sound_
- _Video_ and _Sound_ are rendered within a HTML5 `<video>` element
- _Image_ canvases are renderered with [OpenSeadragon](https://openseadragon.github.io/)
- Supports HLS streaming for **.m3u8** extentions

---

## Documentation

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Active Canvas](#active-canvas)
- [Custom Theme](#custom-theme)
- [Reference](#reference)
- [Manifest Requirements](#manifest-requirements)
- [Development](#development)

---

## Installation

Install the component from your command line using `npm install`,

```shell
npm install @nulib/react-media-player
```

**OR** if you prefer Yarn, use `yarn add`.

```shell
yarn add @nulib/react-media-player
```

---

## Basic Usage

Add the ReactMediaPlayer component to your `jsx` or `tsx` code.

```jsx
import ReactMediaPlayer from "@nulib/react-media-player";
```

Mnimal usage providing the `<ReactMediaPlayer/>` component with an external manifest.

```jsx
const manifestId =
  "https://raw.githubusercontent.com/nulib/react-media-player/main/public/fixtures/iiif/manifests/sample.json";

return <ReactMediaPlayer manifestId={manifestId} />;
```

[See Example](https://codesandbox.io/s/nulib-react-media-player-sample-i0huq?file=/src/App.tsx)

---

## Active Canvas

Example on using `canvasIdCallback` to return to your consuming application the active canvas ID. This will return as a string.

```jsx
const manifestId =
  "https://raw.githubusercontent.com/nulib/react-media-player/main/public/fixtures/iiif/manifests/sample.json";

const handlCanvasIdCallback = (activeCanvasId) => {
  if (activeCanvasId) console.log(activeCanvasId);
};

return (
  <ReactMediaPlayer
    manifestId={manifestId}
    canvasIdCallback={handlCanvasIdCallback}
  />
);
```

[See Example](https://codesandbox.io/s/nulib-react-media-player-sample-i0huq?file=/src/App.tsx)

---

## Custom Theme

You may choose to override the base theme by setting optional colors and fonts. Naming conventions for colors are limited to those shown in the config example below.

```jsx
const manifestId =
  "https://raw.githubusercontent.com/nulib/react-media-player/main/public/fixtures/iiif/manifests/sample.json";

const customTheme = {
  colors: {
    /**
     * Black and dark grays in a light theme.
     * All must contrast to 4.5 or greater with `secondary`.
     */
    primary: "#37474F",
    primaryMuted: "#546E7A",
    primaryAlt: "#263238",

    /**
     * Key brand color(s).
     * `accent` must contrast to 4.5 or greater with `secondary`.
     */
    accent: "#C62828",
    accentMuted: "#E57373",
    accentAlt: "#B71C1C",

    /**
     * White and light grays in a light theme.
     * All must must contrast to 4.5 or greater with `primary` and  `accent`.
     */
    secondary: "#FFFFFF",
    secondaryMuted: "#ECEFF1",
    secondaryAlt: "#CFD8DC",
  },
  fonts: {
    sans: "'Avenir', 'Helvetica Neue', sans-serif",
    display: "Optima, Georgia, Arial, sans-serif",
  },
};

return <ReactMediaPlayer manifestId={manifestId} customTheme={customTheme} />;
```

[See Example](https://codesandbox.io/s/nulib-react-media-player-custom-theme-g6m5v)

---

## Reference

| Prop                          | Type       | Required | Default |
| ----------------------------- | ---------- | -------- | ------- |
| `manifestId`                  | `string`   | Yes      |         |
| `canvasIdCallback`            | `function` | No       |         |
| `customTheme`                 | `object`   | No       |         |
| `options`                     | `object`   | No       |         |
| `options.showTitle`           | `boolean`  | No       | true    |
| `options.showIIIFBadge`       | `boolean`  | No       | true    |
| `options.ignoreCaptionLabels` | `string[]` | No       | []      |

RMP version 1.4.0, introduces an `options` prop, which will serve as a configuration object for common configuration options.

```jsx
import ReactMediaPlayer from "@nulib/react-media-player";

...

// Supported options
const options = {
  // Primary title (Manifest label) for top level canvas.  Defaults to true
  showTitle: false,

  // IIIF Badge and popover containing options.  Defaults to true
  showIIIFBadge: false,

  // Ignore supplementing canvases by label value that are not for captioning
  ignoreCaptionLabels: ['Chapters']
}
...

<ReactMediaPlayer manifestId={...} options={options} />
```

---

## Manifest Requirements

The manifest provided to `manifestId`:

- MUST be a [IIIF Presentation API](https://iiif.io/api/presentation/3.0/) valid manifest,
- MUST have at least one canvas with an annotation of the **motivation** of `painting` and content resource with the **type** of `Video`, `Sound`, or `Image`
- SHOULD have canvases with annotations of the **motivation** of `supplementing` and content resource with the **format** of `text/vtt`
- MAY have HLS streaming media, however, the file extension MUST be `.m3u8` for `Sound` and `Video`

---

## Development

React Media Player is built with:

- TypeScript
- [ESBuild](https://esbuild.github.io/)
- [Hyperion Framework](https://hyperion.stephen.wf/the-vault/vault-api/)
- [OpenSeadragon](https://openseadragon.github.io/)
- [Radix UI](https://www.radix-ui.com/)
- [Stitches](https://stitches.dev/)

### Environment

This will open up a local dev server with live reloading.

```
npm install
npm run dev
```

### Build

This will build and package the component

```
npm run build
```

#### Notes

- ESBuild compiles TypeScript to JavaScript, but does not do type checking. To view type checking errors (in addtion to what your IDE will be complaining about), run:

```
tsc
```

## License

This project is available under the [MIT License](https://github.com/nulib/react-media-player/blob/main/LICENSE).
