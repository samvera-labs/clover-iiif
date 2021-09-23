# React Media Player

A React component which renders a YouTube style player and thumbnails UI. We're aiming for:

-   Switching between video or audio files
-   Using native HTML `<video />` element
-   Rendering navigable sections based (initially) on `WebVTT` structure
-   Driven by IIIF structure

## Development environment

This will open up a local dev server with live reloading.

```
npm install
npm run dev
```

## Build

This will build and package a component for NPM distribution

```
npm run build
```

### Notes

-   ESBuild compiles TypeScript to JavaScript, but does not do type checking. To view type checking errors (in addtion to what your IDE will be complaining about), run:

```
tsc
```
