import { useMediaPlayer } from "@vidstack/react";
import { useEffect } from "react";

import { useViewerState } from "src/context/viewer-context";

/**
 * Applies the shared caption selection to the player.
 *
 * `activeCaptionSrc` is the single source of truth, and this is the only thing that writes a
 * track's mode. Whichever menu the reader used — the player's or the transcript's — published
 * the choice when they made it, so there is one direction of travel and nothing to echo.
 *
 * It used to run the other way as well, mirroring Vidstack's active track back into the store.
 * That could not settle: `useActiveTextTrack` and the `mode` flags on the track list disagree
 * with each other during a switch, so the two effects read different answers and corrected one
 * another several hundred times a second, refetching a WebVTT file on every pass and leaving
 * the picker and the transcript showing different languages.
 *
 * Renders nothing. It exists as a component rather than living in `PlayerMedia` because
 * Vidstack's hooks read the media context, and `PlayerMedia` is the component that *creates*
 * `<MediaPlayer>` — calling them there throws. This has to be mounted inside it.
 */
const CaptionSync: React.FC = () => {
  const player = useMediaPlayer();
  const { activeCaptionSrc } = useViewerState();

  useEffect(() => {
    const tracks: any = player?.textTracks;
    if (!activeCaptionSrc || !tracks) return;

    const all = Array.from(tracks as Iterable<any>);
    const target = all.find((track) => track?.src === activeCaptionSrc);
    if (!target) return;

    const showing = all.filter(
      (track) => track?.kind === "captions" && track.mode === "showing",
    );

    /**
     * Captions are off, so the selection stays a selection. Picking a transcript to read is
     * not a request to start drawing captions over the video.
     */
    if (!showing.length) return;
    if (showing.length === 1 && showing[0] === target) return;

    /* Exactly one captions track may be showing, or the overlay draws two languages at once. */
    showing.forEach((track) => {
      if (track !== target) track.mode = "disabled";
    });
    target.mode = "showing";
  }, [activeCaptionSrc, player]);

  return null;
};

export default CaptionSync;
