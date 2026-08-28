import React from "react";
import { styled } from "src/styles/stitches.config";
import { toggleFullscreen } from "src/lib/fullscreen";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

/**
 * The way out of full screen, for whichever Clover root is in it.
 *
 * Hidden by default and revealed by the host: the `Viewer` shows it when its own root is full
 * screen, and a standalone `Image` when its wrapper is. Keeping the rule with the host is what
 * lets an `Image` nested inside a full-screen `Viewer` stay quiet — only one root is ever full
 * screen, and only that one should offer a way back.
 *
 * `Escape` exits too. This exists because an unadvertised keystroke is not an affordance: a
 * reader who entered by clicking looks for something to click.
 */
const ExitFullscreenStyled = styled("button", {
  display: "none",
  position: "absolute",
  top: "1rem",
  left: "1rem",
  zIndex: "3",

  alignItems: "center",
  gap: "0.5rem",
  height: "2.5rem",
  padding: "0 1rem 0 0.75rem",
  border: "none",
  borderRadius: "2rem",
  backgroundColor: "$secondary",
  color: "$primary",
  fontFamily: "inherit",
  fontSize: "0.8333rem",
  fontWeight: "700",
  lineHeight: "1",
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "$all",

  svg: {
    height: "1.25rem",
    width: "1.25rem",
    flexShrink: 0,
  },

  "&:hover, &:focus-visible": {
    backgroundColor: "$accent",
    color: "$secondary",
  },
});

const ExitFullscreen: React.FC = () => {
  const { t } = useCloverTranslation();
  const label = t("imageExitFullScreen");

  return (
    <ExitFullscreenStyled
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
    </ExitFullscreenStyled>
  );
};

export { ExitFullscreenStyled };
export default ExitFullscreen;
