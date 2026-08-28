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
