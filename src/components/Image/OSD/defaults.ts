import { Options } from "openseadragon";

function defaultOpenSeadragonConfiguration(
  openSeadragonInstance: string,
): Options {
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
  };
}

export default defaultOpenSeadragonConfiguration;
