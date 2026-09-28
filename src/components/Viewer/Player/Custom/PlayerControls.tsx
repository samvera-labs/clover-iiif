import {
  CaptionsIcon,
  ChaptersIcon,
  CheckIcon,
  ExitFullScreenIcon,
  FullScreenIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
  VolumeHighIcon,
  VolumeMutedIcon,
} from "src/components/Viewer/Player/Custom/Icons";
import {
  ChapterTitle,
  Controls,
  Menu,
  MuteButton,
  PlayButton,
  Time,
  TimeSlider,
  VolumeSlider,
  useCaptionOptions,
  useChapterOptions,
  useMediaState,
} from "@vidstack/react";
import React, { useCallback, useState } from "react";

import { PlayerSource } from "src/hooks/use-iiif/getPlayerResources";
import { getCloverRoot, toggleFullscreen } from "src/lib/fullscreen";
import useFullscreen from "src/hooks/useFullscreen";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import { useViewerState } from "src/context/viewer-context";

interface PlayerControlsProps {
  isAudio: boolean;
  sources: PlayerSource[];
}

/**
 * The transport bar.
 *
 * Geometry, radius, transition and the accent-invert hover all mirror
 * `Image/Controls/Button.css`, so the player reads as the same component family as the
 * OpenSeadragon controls. The difference is that these overlay the media and auto-hide.
 */
const PlayerControls: React.FC<PlayerControlsProps> = ({
  isAudio,
  sources,
}) => {
  const { t } = useCloverTranslation();
  const { configOptions } = useViewerState();

  const isPaused = useMediaState("paused");
  const isMuted = useMediaState("muted");

  const captionOptions = useCaptionOptions();
  const chapterOptions = useChapterOptions();

  const [root, setRoot] = useState<HTMLElement | null>(null);
  const isFullscreen = useFullscreen(root);

  /**
   * Clover owns full screen, not Vidstack. Both implement it, and letting Vidstack take the
   * media element alone would drop the header, the thumbnail rail and the information panel
   * out of view — the exact failure `src/lib/fullscreen.ts` exists to avoid — and would leave
   * `data-fullscreen` and `ExitFullscreen` reporting the wrong thing.
   */
  const onFullscreen = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) =>
      toggleFullscreen(event.currentTarget),
    [],
  );

  /**
   * Audio has no video surface to hover, so its bar never hides — there would be no way to
   * bring it back short of guessing. `hideOnMouseLeave` is likewise video-only.
   */
  const hideDelay = isAudio
    ? Infinity
    : (configOptions.player?.hideDelay ?? 2000);

  const hasCaptions = captionOptions.length > 0;
  const hasChapters = chapterOptions.length > 0;
  const hasSources = sources.length > 1;

  return (
    <Controls.Root
      className="clover-viewer-player-controls"
      data-audio={isAudio || undefined}
      data-testid="clover-viewer-player-controls"
      hideDelay={hideDelay}
      hideOnMouseLeave={!isAudio}
      ref={(el) => setRoot(getCloverRoot(el as Element | null))}
    >
      <Controls.Group className="clover-viewer-player-controls-chapter">
        <ChapterTitle className="clover-viewer-player-chapter-title" />
      </Controls.Group>

      <Controls.Group className="clover-viewer-player-controls-slider">
        <TimeSlider.Root
          aria-label={t("playerSeek")}
          className="clover-viewer-player-slider"
        >
          <TimeSlider.Chapters className="clover-viewer-player-slider-chapters">
            {(cues, forwardRef) => (
              <div
                className="clover-viewer-player-slider-chapter"
                ref={forwardRef}
              >
                {cues.map((cue) => (
                  <div
                    className="clover-viewer-player-slider-track"
                    key={`${cue.startTime}-${cue.text}`}
                  >
                    <TimeSlider.TrackFill className="clover-viewer-player-slider-fill" />
                    <TimeSlider.Progress className="clover-viewer-player-slider-progress" />
                  </div>
                ))}
              </div>
            )}
          </TimeSlider.Chapters>
          <TimeSlider.Thumb className="clover-viewer-player-slider-thumb" />
        </TimeSlider.Root>
      </Controls.Group>

      <Controls.Group className="clover-viewer-player-controls-bar">
        <PlayButton
          aria-label={isPaused ? t("playerPlay") : t("playerPause")}
          className="clover-viewer-player-button"
          data-button="play"
        >
          {isPaused ? <PlayIcon /> : <PauseIcon />}
        </PlayButton>

        <div className="clover-viewer-player-volume">
          <MuteButton
            aria-label={isMuted ? t("playerUnmute") : t("playerMute")}
            className="clover-viewer-player-button"
            data-button="mute"
          >
            {isMuted ? <VolumeMutedIcon /> : <VolumeHighIcon />}
          </MuteButton>
          <VolumeSlider.Root
            aria-label={t("playerVolume")}
            className="clover-viewer-player-volume-slider"
          >
            <VolumeSlider.Track className="clover-viewer-player-slider-track">
              <VolumeSlider.TrackFill className="clover-viewer-player-slider-fill" />
            </VolumeSlider.Track>
            <VolumeSlider.Thumb className="clover-viewer-player-slider-thumb" />
          </VolumeSlider.Root>
        </div>

        <div className="clover-viewer-player-time">
          <Time aria-label={t("playerCurrentTime")} type="current" />
          <span aria-hidden="true">/</span>
          <Time aria-label={t("playerDuration")} type="duration" />
        </div>

        <span className="clover-viewer-player-controls-spacer" />

        {hasCaptions && (
          <RadioMenu
            className="clover-viewer-player-button"
            dataButton="captions"
            icon={<CaptionsIcon />}
            label={t("playerCaptions")}
            options={captionOptions}
          />
        )}

        {hasChapters && (
          <RadioMenu
            className="clover-viewer-player-button"
            dataButton="chapters"
            icon={<ChaptersIcon />}
            label={t("playerChapters")}
            options={chapterOptions}
          />
        )}

        {hasSources && (
          <RadioMenu
            className="clover-viewer-player-button"
            dataButton="source"
            icon={<SettingsIcon />}
            label={t("playerSource")}
            options={sources.map((source) => ({
              label: source.label,
              value: source.src,
              select: () => undefined,
            }))}
          />
        )}

        <button
          aria-label={
            isFullscreen ? t("playerExitFullScreen") : t("playerFullScreen")
          }
          className="clover-viewer-player-button"
          data-button="fullscreen"
          onClick={onFullscreen}
          type="button"
        >
          {isFullscreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
        </button>
      </Controls.Group>
    </Controls.Root>
  );
};

/**
 * One menu shape for captions, chapters and sources. Vidstack's `useCaptionOptions` and
 * `useChapterOptions` already return `{ label, value, select, selected }`, so the sources list
 * is mapped into the same shape rather than growing a second menu component.
 */
function RadioMenu({
  className,
  dataButton,
  icon,
  label,
  options,
}: {
  className: string;
  dataButton: string;
  icon: React.ReactNode;
  label: string;
  options: any;
}) {
  return (
    <Menu.Root className="clover-viewer-player-menu">
      <Menu.Button
        aria-label={label}
        className={className}
        data-button={dataButton}
      >
        {icon}
      </Menu.Button>
      <Menu.Content
        className="clover-viewer-player-menu-content"
        placement="top end"
      >
        <div className="clover-viewer-player-menu-label">{label}</div>
        <Menu.RadioGroup
          className="clover-viewer-player-menu-group"
          value={options.selectedValue}
        >
          {options.map(({ label: optionLabel, value, select }: any) => (
            <Menu.Radio
              className="clover-viewer-player-menu-item"
              key={value}
              onSelect={select}
              value={value}
            >
              <span
                className="clover-viewer-player-menu-check"
                aria-hidden="true"
              >
                <CheckIcon />
              </span>
              {optionLabel}
            </Menu.Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

export default PlayerControls;
