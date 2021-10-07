# React Media Player

_Note: This is an alpha release in current development_

A React component media player which:

- Is fed a IIIF 3.0 manifest
- Renders a YouTube style video/audio/image player/displayer
- Renders Thumbnails UI navigation between.
- Renders WebVTT captions and/or navigable ranges in video/audio

We're aiming for:

- Lightweight
- Simple display/UI

We're using

- TypeScript
- [Hyperion Framework](https://hyperion.stephen.wf/the-vault/vault-api/)
- [ESBuild](https://esbuild.github.io/)
- [Stiches](https://stitches.dev/)

## Development environment

This will open up a local dev server with live reloading.

```
npm install
npm run dev
```

## Build

This will build and package the component

```
npm run build
```

### Notes

- ESBuild compiles TypeScript to JavaScript, but does not do type checking. To view type checking errors (in addtion to what your IDE will be complaining about), run:

```
tsc
```
