import { Options } from "openseadragon";

// Skip OSD's default zoom/pan easing for users who ask the OS for reduced
// motion. Guarded for SSR, where matchMedia doesn't exist.
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function defaultOpenSeadragonConfiguration(
  openSeadragonInstance: string,
): Options {
  const reducedMotion = prefersReducedMotion();

  return {
    id: `openseadragon-${openSeadragonInstance}`,
    navigatorId: `openseadragon-navigator-${openSeadragonInstance}`,
    /*
     * EXPERIMENT — pins OpenSeadragon's canvas drawer.
     *
     * OSD 6 defaults to `drawer: ["auto"]`, which prefers WebGL. The WebGL drawer can lose a
     * one-shot draw: the first image is drawn once, and if the compositor reads the drawing
     * buffer after it is cleared the stage looks empty until something drives continuous
     * redraws — which is exactly what clicking zoom does. This machine's preview falls back
     * to the 2D canvas drawer, where the symptom does not appear, so this pins that drawer
     * to test whether the WebGL one is the cause.
     *
     * Revert by deleting this line if it makes no difference.
     */
    drawer: "canvas",
    loadTilesWithAjax: true,
    fullPageButton: `fullPage-${openSeadragonInstance}`,
    homeButton: `reset-${openSeadragonInstance}`,
    rotateLeftButton: `rotateLeft-${openSeadragonInstance}`,
    rotateRightButton: `rotateRight-${openSeadragonInstance}`,
    zoomInButton: `zoomIn-${openSeadragonInstance}`,
    zoomOutButton: `zoomOut-${openSeadragonInstance}`,
    showNavigator: true,
    /*
     * Whether Clover renders a full-screen control, not whether OpenSeadragon binds one.
     * `OSD.tsx` hands OpenSeadragon `false` regardless — see the comment there.
     */
    showFullPageControl: true,
    showHomeControl: true,
    showRotationControl: true,
    showZoomControl: true,
    navigatorBorderColor: "transparent",
    gestureSettingsMouse: {
      clickToZoom: true,
      dblClickToZoom: true,
      pinchToZoom: true,
      scrollToZoom: false,
    },
    preserveViewport: true,
    ...(reducedMotion && { animationTime: 0 }),
  };
}

export default defaultOpenSeadragonConfiguration;
