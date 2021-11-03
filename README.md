<img width="1086" alt="image" src="https://user-images.githubusercontent.com/7376450/139940344-53bfdc9d-fe2a-48c8-8377-8bf806ce3e7b.png">

# React Media Player

**An A/V media viewer driven by IIIF Presentation 3.0 API built with React.js**

[**View Demo**](https://codesandbox.io/s/nulib-react-media-player-sample-i0huq)

React Media Player is a UI component that renders a multicanvas IIIF viewer intended for `Video` and `Sound` content resources with minimal support for `Image`. Provide a [IIIF Presentation 3.0](https://iiif.io/api/presentation/3.0/) manifest and the component:

- Renders a multi-canvas _Video_, _Sound_, and _Image_ viewer
- Renders thumbnails as navigation between canvases
- Renders annotations with the [motivation](https://iiif.io/api/presentation/3.0/#values-for-motivation) of `supplementing` with a content resource having the format of `text/vtt` for _Video_ and _Sound_
- Supports HLS streaming for **.m3u8** extentions

---

## Documentation

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Active Canvas](#active-canvas)
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

Add the ReactMediaPlayer component to you your `jsx` or `tsx` code.

```jsx
import ReactMediaPlayer from "@nulib/react-media-player";
```

Mnimal usage providing the `<ReactMediaPlayer/>` component with an external manifest.

```jsx
const manifestId =
  "https://raw.githubusercontent.com/nulib/react-media-player/2376-docs/public/fixtures/iiif/manifests/sample.json";

return <ReactMediaPlayer manifestId={manifestId} />;
```

[See Example](https://codesandbox.io/s/nulib-react-media-player-sample-i0huq?file=/src/App.tsx)

---

## Active Canvas

Example on using `canvasIdCallback` to return to your consuming application the active canvas ID. This will return as a string.

```jsx
const manifestId =
  "https://raw.githubusercontent.com/nulib/react-media-player/2376-docs/public/fixtures/iiif/manifests/sample.json";

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

## Reference

| Prop               | Type     | Required |
| ------------------ | -------- | -------- |
| `manifestId`       | String   | Yes      |
| `canvasIdCallback` | Function | No       |

---

## Manifest Requirements

The manifest provided to `manifestId`:

- MUST be a [IIIF Presentation 3.0 API](https://iiif.io/api/presentation/3.0/) valid manifest,
- MUST have at least one canvas with an annotation of the **motivation** of `painting` and content resource with the **type** of `Video`, `Sound`, or `Image`
- SHOULD have canvases with annotations of the **motivation** of `supplementing` and content resource with the **format** of `text/vtt`
- MAY have HLS streaming media, however, the file extension MUST be `.m3u8` for `Sound` and `Video`

---

## Development

React Media Player is built with:

- TypeScript
- [Hyperion Framework](https://hyperion.stephen.wf/the-vault/vault-api/)
- [ESBuild](https://esbuild.github.io/)
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
