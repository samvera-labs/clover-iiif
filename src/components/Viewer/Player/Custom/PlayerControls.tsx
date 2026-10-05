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
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

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
  const viewerDispatch = useViewerDispatch();

  const isPaused = useMediaState("paused");
  const isMuted = useMediaState("muted");

  /**
   * Vidstack composes the "off" entry itself and labels it with its own English string, so the
   * label has to be handed in or the one row in the menu that is not a track name stays
   * untranslated next to rows that are.
   */
  const captionOptions = useCaptionOptions({ off: t("playerCaptionsOff") });

  /**
   * Choosing a language here is what publishes the shared selection.
   *
   * Both caption menus belong to Clover — this one and the transcript's — so each can write
   * `activeCaptionSrc` directly when the reader picks something. Nothing watches the player's
   * state and writes it back, which is what kept the two out of step: Vidstack's idea of the
   * active track and the `mode` flags on the track list do not always agree, so an effect that
   * mirrored one into the store and an effect that applied the store to the other had different
   * answers and corrected each other indefinitely.
   *
   * "Off" carries no track and so publishes nothing. Hiding the overlay is not a statement
   * about which transcript the reader wants to keep reading.
   */
  const captionMenuOptions = React.useMemo(
    () =>
      captionOptions.map((option) => ({
        label: option.label,
        value: option.value,
        select: (event?: Event) => {
          option.select(event);
          const src = (option.track as any)?.src;
          if (src)
            viewerDispatch({
              type: "updateActiveCaptionSrc",
              activeCaptionSrc: src,
            });
        },
      })),
    [captionOptions, viewerDispatch],
  );
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

  /**
   * `useCaptionOptions` always contributes an "Off" entry, so its length is 1 even when the
   * Manifest supplies no `supplementing` VTT at all. Counting it offered a captions button
   * whose only choice was to turn off captions that were never there — so the real tracks are
   * what decide whether the control appears.
   */
  const hasCaptions = captionOptions.some((option) => option.track);
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
          {/*
            One element per cue, each taking the ref.
            
            Vidstack hands the whole cue list to a single call of this function and then sizes
            each returned element to its chapter's share of the duration, giving each its own
            `--chapter-fill`. Returning one wrapper around a list of segments instead made that
            wrapper the only chapter: it was sized to the full duration, every segment inside it
            shared the whole slider's fill so they all advanced together, and the segments
            divided the bar evenly rather than by length — a 5-minute prelude drawn the same
            width as the hour that follows it.
          */}
          <TimeSlider.Chapters className="clover-viewer-player-slider-chapters">
            {(cues, forwardRef) =>
              cues.map((cue) => (
                <div
                  className="clover-viewer-player-slider-chapter"
                  key={`${cue.startTime}-${cue.endTime}-${cue.text}`}
                  ref={forwardRef}
                >
                  <div className="clover-viewer-player-slider-track">
                    <TimeSlider.TrackFill className="clover-viewer-player-slider-fill" />
                    <TimeSlider.Progress className="clover-viewer-player-slider-progress" />
                  </div>
                </div>
              ))
            }
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
            options={captionMenuOptions}
            selectedValue={captionOptions.selectedValue}
          />
        )}

        {hasChapters && (
          <RadioMenu
            className="clover-viewer-player-button"
            dataButton="chapters"
            icon={<ChaptersIcon />}
            label={t("playerChapters")}
            options={chapterOptions}
            selectedValue={chapterOptions.selectedValue}
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
 *
 * `selectedValue` arrives as its own prop. Vidstack hangs it off the options array as a
 * property, which only survives for as long as nothing maps over the array.
 */
function RadioMenu({
  className,
  dataButton,
  icon,
  label,
  options,
  selectedValue,
}: {
  className: string;
  dataButton: string;
  icon: React.ReactNode;
  label: string;
  options: any;
  selectedValue?: string;
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
          value={selectedValue}
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
