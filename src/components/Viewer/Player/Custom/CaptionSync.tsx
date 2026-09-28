import { useActiveTextTrack, useMediaPlayer } from "@vidstack/react";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

import { useEffect } from "react";

/**
 * Keeps the player's caption choice and the information panel's transcript on the same track.
 *
 * Renders nothing. It exists as a component rather than living in `PlayerMedia` because
 * Vidstack's hooks read the media context, and `PlayerMedia` is the component that *creates*
 * `<MediaPlayer>` — calling them there throws. This has to be mounted inside it.
 *
 * The selection and the overlay are deliberately separate. Turning captions off hides the
 * cues drawn over the video; it says nothing about which transcript the reader wants to read
 * in the panel, so "off" never clears the selection.
 */
const CaptionSync: React.FC = () => {
  const player = useMediaPlayer();
  const activeTextTrack = useActiveTextTrack("captions");
  const { activeCaptionSrc } = useViewerState();
  const viewerDispatch = useViewerDispatch();

  /** Player → panel: the language chosen here is the transcript the panel shows. */
  useEffect(() => {
    const src = (activeTextTrack as any)?.src;
    if (!src || src === activeCaptionSrc) return;
    viewerDispatch({ type: "updateActiveCaptionSrc", activeCaptionSrc: src });
  }, [activeTextTrack, activeCaptionSrc, viewerDispatch]);

  /**
   * Panel → player: follow the panel's choice, but only when captions are already showing.
   * Picking a transcript to read is not a request to start drawing captions over the video.
   */
  useEffect(() => {
    const tracks: any = player?.textTracks;
    if (!activeCaptionSrc || !tracks) return;

    const all = Array.from(tracks as Iterable<any>);
    const target = all.find((track) => track?.src === activeCaptionSrc);
    if (!target || target.mode === "showing") return;

    const isShowingCaptions = all.some(
      (track) => track?.kind === "captions" && track.mode === "showing",
    );
    if (isShowingCaptions) target.mode = "showing";
  }, [activeCaptionSrc, player]);

  return null;
};

export default CaptionSync;
