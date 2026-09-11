import React from "react";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

// Same glyphs as the OpenSeadragon zoom controls (src/components/Image/Controls/Controls.tsx)
// so the Map tab's zoom buttons read as the same control across the Viewer.
const ZoomIn = () => (
  <path
    strokeLinecap="round"
    strokeMiterlimit="10"
    strokeWidth="45"
    d="M256 112v288M400 256H112"
  />
);

const ZoomOut = () => (
  <path
    strokeLinecap="round"
    strokeMiterlimit="10"
    strokeWidth="45"
    d="M400 256H112"
  />
);

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const Controls: React.FC<MapControlsProps> = ({ onZoomIn, onZoomOut }) => {
  const { t } = useCloverTranslation();

  return (
    <div className="clover-map-controls" data-testid="clover-map-controls">
      <button
        className="clover-map-control"
        type="button"
        onClick={onZoomIn}
        data-testid="clover-map-zoom-in"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
          viewBox="0 0 512 512"
          role="img"
        >
          <title>{t("imageZoomIn")}</title>
          <ZoomIn />
        </svg>
      </button>
      <button
        className="clover-map-control"
        type="button"
        onClick={onZoomOut}
        data-testid="clover-map-zoom-out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
          viewBox="0 0 512 512"
          role="img"
        >
          <title>{t("imageZoomOut")}</title>
          <ZoomOut />
        </svg>
      </button>
    </div>
  );
};

export default Controls;
