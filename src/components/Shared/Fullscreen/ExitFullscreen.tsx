import React from "react";
import { toggleFullscreen } from "src/lib/fullscreen";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

const ExitFullscreen: React.FC = () => {
  const { t } = useCloverTranslation();
  const label = t("imageExitFullScreen");

  return (
    <button
      aria-label={label}
      className="clover-exit-full-screen"
      onClick={(event) => void toggleFullscreen(event.currentTarget)}
      type="button"
    >
      <svg viewBox="0 0 512 512" aria-hidden="true" focusable="false">
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="45"
          d="M244 400L100 256l144-144M120 256h292"
        />
      </svg>
      {label}
    </button>
  );
};

export default ExitFullscreen;
