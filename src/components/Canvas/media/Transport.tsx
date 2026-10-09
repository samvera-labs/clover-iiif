import React, { useEffect, useRef, useState } from "react";

import {
  type MediaController,
  formatTime,
} from "src/components/Canvas/media/useMediaController";
import {
  CaptionsIcon,
  ExitFullScreenIcon,
  FullScreenIcon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeMutedIcon,
} from "src/components/Viewer/Player/Custom/Icons";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import { toggleFullscreen } from "src/lib/fullscreen";

interface TransportProps {
  instance: string;
  controller: MediaController;
  kind: "video" | "audio";
  captions: Array<{ label: string }>;
  /** The caption track showing, or -1 for none. */
  activeCaption: number;
  onCaptionChange: (index: number) => void;
  /** Offer full screen at the end of the bar (a lone media Canvas has no other chrome). */
  fullscreen?: boolean;
  isFullscreen?: boolean;
}

/**
 * Clover's own transport for a Canvas's video or sound, styled as the Player's bar:
 * the seek bar across the top, play, volume and time below, captions to the right.
 *
 * Native controls throughout — a range input is the seek bar and the volume — so every
 * control is reachable and named without a widget library, and drives the element only
 * through the headless controller.
 */
const Transport: React.FC<TransportProps> = ({
  instance,
  controller,
  kind,
  captions,
  activeCaption,
  onCaptionChange,
  fullscreen = false,
  isFullscreen = false,
}) => {
  const { t } = useCloverTranslation();
  const [captionsOpen, setCaptionsOpen] = useState(false);
  const captionsRef = useRef<HTMLDivElement>(null);
  const { paused, currentTime, duration, buffered, muted, volume } = controller;
  const captionsMenu = `${instance}-captions`;

  useEffect(() => {
    if (!captionsOpen) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (
        event instanceof PointerEvent &&
        captionsRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setCaptionsOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [captionsOpen]);

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const loaded = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      className="clover-canvas-transport"
      data-kind={kind}
      data-testid="clover-canvas-transport"
    >
      <div className="clover-canvas-transport-seek-area">
        <input
          aria-label={t("playerSeek")}
          aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
          className="clover-canvas-transport-seek"
          max={duration || 0}
          min={0}
          onChange={(event) => controller.seek(Number(event.target.value))}
          step="any"
          style={
            {
              "--clover-transport-progress": `${progress}%`,
              "--clover-transport-loaded": `${loaded}%`,
            } as React.CSSProperties
          }
          type="range"
          value={currentTime}
        />
      </div>

      <div className="clover-canvas-transport-bar">
        <button
          aria-label={paused ? t("playerPlay") : t("playerPause")}
          className="clover-canvas-transport-button"
          data-button={paused ? "play" : "pause"}
          onClick={controller.toggle}
          type="button"
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>

        <button
          aria-label={muted ? t("playerUnmute") : t("playerMute")}
          className="clover-canvas-transport-button"
          data-button="mute"
          onClick={controller.toggleMute}
          type="button"
        >
          {muted || volume === 0 ? <VolumeMutedIcon /> : <VolumeHighIcon />}
        </button>
        <input
          aria-label={t("playerVolume")}
          className="clover-canvas-transport-volume"
          max={1}
          min={0}
          onChange={(event) => controller.setVolume(Number(event.target.value))}
          step={0.05}
          style={
            {
              "--clover-transport-progress": `${(muted ? 0 : volume) * 100}%`,
            } as React.CSSProperties
          }
          type="range"
          value={muted ? 0 : volume}
        />

        <span className="clover-canvas-transport-time">
          <span aria-label={t("playerCurrentTime")}>
            {formatTime(currentTime)}
          </span>
          <span aria-hidden="true"> / </span>
          <span aria-label={t("playerDuration")}>{formatTime(duration)}</span>
        </span>

        <span className="clover-canvas-transport-spacer" />

        {captions.length > 0 && (
          <div className="clover-canvas-transport-menu" ref={captionsRef}>
            <button
              aria-controls={captionsMenu}
              aria-expanded={captionsOpen}
              aria-label={t("playerCaptions")}
              className="clover-canvas-transport-button"
              data-active={activeCaption >= 0 ? "" : undefined}
              data-button="captions"
              onClick={() => setCaptionsOpen((open) => !open)}
              type="button"
            >
              <CaptionsIcon />
            </button>
            {captionsOpen && (
              <fieldset
                aria-label={t("playerCaptions")}
                className="clover-canvas-transport-options"
                id={captionsMenu}
              >
                {[{ label: t("playerCaptionsOff") }, ...captions].map(
                  (option, index) => (
                    <label
                      className="clover-canvas-transport-option"
                      key={index}
                    >
                      <input
                        checked={activeCaption === index - 1}
                        name={captionsMenu}
                        onChange={() => {
                          onCaptionChange(index - 1);
                          setCaptionsOpen(false);
                        }}
                        type="radio"
                      />
                      <span>{option.label}</span>
                    </label>
                  ),
                )}
              </fieldset>
            )}
          </div>
        )}
        {fullscreen && (
          <button
            aria-label={
              isFullscreen ? t("playerExitFullScreen") : t("playerFullScreen")
            }
            className="clover-canvas-transport-button"
            data-button="fullscreen"
            // Straight from the click: the Fullscreen API only honours a user gesture.
            onClick={(event) => void toggleFullscreen(event.currentTarget)}
            type="button"
          >
            {isFullscreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Transport;
