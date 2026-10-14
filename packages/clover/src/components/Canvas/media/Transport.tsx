import React, { useEffect, useRef, useState } from "react";

import { type MediaController, formatTime } from "./useMediaController";
import { SHORTCUTS, Tip } from "../../../ui/Tip";
import { useOneOpen } from "../../../ui/useOneOpen";
import {
  CaptionsIcon,
  ChaptersIcon,
  ExitFullScreenIcon,
  FullScreenIcon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeMutedIcon,
} from "../../../ui/mediaIcons";
import { useCloverTranslation } from "../../../i18n/useCloverTranslation";
import { toggleFullscreen } from "../../../lib/fullscreen";
import useFullscreenSupported from "../../../hooks/useFullscreenSupported";

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
  /** The video, which goes full screen in the system player where the root cannot. */
  video?: HTMLVideoElement | null;
  /** Chapters, from the Manifest's Ranges: marked on the seek bar and listed in a menu. */
  chapters?: TransportChapter[];
}

export interface TransportChapter {
  label: string;
  start: number;
  end?: number;
}

/**
 * A menu button over a set of radio options: open on press, closed by Escape, an outside
 * press, or picking an option. Captions and chapters both use it.
 */
function TransportMenu({
  id,
  label,
  button,
  icon,
  active,
  options,
  selected,
  onSelect,
}: {
  id: string;
  label: string;
  button: string;
  icon: React.ReactNode;
  active?: boolean;
  options: string[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  useOneOpen(open, () => setOpen(false));
  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (
        event instanceof PointerEvent &&
        menu.current?.contains(event.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  return (
    <div className="clover-canvas-transport-menu" ref={menu}>
      <button
        aria-controls={id}
        aria-expanded={open}
        aria-label={label}
        className="clover-canvas-transport-button"
        data-active={active ? "" : undefined}
        data-button={button}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {icon}
        <Tip label={label} />
      </button>
      {open && (
        <fieldset
          aria-label={label}
          className="clover-canvas-transport-options"
          id={id}
        >
          {options.map((option, index) => (
            <label className="clover-canvas-transport-option" key={index}>
              <input
                checked={selected === index}
                name={id}
                onChange={() => {
                  onSelect(index);
                  setOpen(false);
                }}
                type="radio"
              />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
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
  video,
  chapters = [],
}) => {
  const { t } = useCloverTranslation();
  // Where the root cannot go full screen (iPhone), a video still can, in the system player.
  const canFullscreen = useFullscreenSupported() || kind === "video";
  const { paused, currentTime, duration, buffered, muted, volume } = controller;
  // The chapter playing: the last to start at or before now.
  let chapter = -1;
  chapters.forEach((candidate, index) => {
    if (candidate.start <= currentTime) chapter = index;
  });

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
        {duration > 0 &&
          chapters
            .slice(1)
            .map((marker, index) => (
              <span
                aria-hidden="true"
                className="clover-canvas-transport-chapter-marker"
                key={index}
                style={{ left: `${(marker.start / duration) * 100}%` }}
              />
            ))}
      </div>

      <div className="clover-canvas-transport-bar">
        <button
          aria-label={paused ? t("playerPlay") : t("playerPause")}
          aria-keyshortcuts={SHORTCUTS.play.keys}
          className="clover-canvas-transport-button"
          data-button={paused ? "play" : "pause"}
          onClick={controller.toggle}
          type="button"
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
          <Tip
            label={paused ? t("playerPlay") : t("playerPause")}
            shortcut={SHORTCUTS.play}
          />
        </button>

        <button
          aria-label={muted ? t("playerUnmute") : t("playerMute")}
          aria-keyshortcuts={SHORTCUTS.mute.keys}
          className="clover-canvas-transport-button"
          data-button="mute"
          onClick={controller.toggleMute}
          type="button"
        >
          {muted || volume === 0 ? <VolumeMutedIcon /> : <VolumeHighIcon />}
          <Tip
            label={muted ? t("playerUnmute") : t("playerMute")}
            shortcut={SHORTCUTS.mute}
          />
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
        {chapter >= 0 && (
          <span className="clover-canvas-transport-chapter">
            {chapters[chapter].label}
          </span>
        )}

        <span className="clover-canvas-transport-spacer" />

        {chapters.length > 0 && (
          <TransportMenu
            id={`${instance}-chapters`}
            label={t("playerChapters")}
            button="chapters"
            icon={<ChaptersIcon />}
            options={chapters.map(
              (item) => `${formatTime(item.start)}  ${item.label}`,
            )}
            selected={chapter}
            onSelect={(index) => controller.seek(chapters[index].start)}
          />
        )}
        {captions.length > 0 && (
          <TransportMenu
            id={`${instance}-captions`}
            label={t("playerCaptions")}
            button="captions"
            icon={<CaptionsIcon />}
            active={activeCaption >= 0}
            options={[
              t("playerCaptionsOff"),
              ...captions.map((caption) => caption.label),
            ]}
            selected={activeCaption + 1}
            onSelect={(index) => onCaptionChange(index - 1)}
          />
        )}
        {fullscreen && canFullscreen && (
          <button
            aria-label={
              isFullscreen ? t("playerExitFullScreen") : t("playerFullScreen")
            }
            className="clover-canvas-transport-button"
            data-button="fullscreen"
            // Straight from the click: the Fullscreen API only honours a user gesture.
            onClick={(event) =>
              void toggleFullscreen(event.currentTarget, video)
            }
            type="button"
          >
            {isFullscreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
            <Tip
              label={
                isFullscreen ? t("playerExitFullScreen") : t("playerFullScreen")
              }
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default Transport;
