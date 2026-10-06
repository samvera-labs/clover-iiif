import React, { useEffect } from "react";
import useWebVtt, { NodeWebVttCueNested } from "src/hooks/use-webvtt";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

import * as RadioGroup from "@radix-ui/react-radio-group";
import { InternationalString } from "@iiif/presentation-3";
import Menu from "src/components/Viewer/InformationPanel/Menu";
import { Select, SelectOption } from "src/components/UI/Select";
import { getLabel } from "src/hooks/use-iiif";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

/** Long enough to outlast choosing from the list, short enough to recover if a close is missed. */
const SCROLL_HOLD_TIMEOUT = 30_000;

type CaptionResource = {
  id?: string;
  label?: InternationalString;
  language?: string | string[];
};

type AnnotationItemVTTProps = {
  captionResources?: CaptionResource[];
  inlineCues?: NodeWebVttCueNested[];
  label: InternationalString | undefined;
  vttUri?: string;
};

function labelFor(resource: CaptionResource, index: number) {
  const value = getLabel(resource.label as InternationalString);
  const text = Array.isArray(value) ? value[0] : value;
  if (text) return text;

  const language = Array.isArray(resource.language)
    ? resource.language[0]
    : resource.language;
  return language || `Track ${index + 1}`;
}

const AnnotationItemVTT: React.FC<AnnotationItemVTTProps> = ({
  captionResources,
  inlineCues,
  label,
  vttUri,
}) => {
  const { t } = useCloverTranslation();
  const dispatch = useViewerDispatch();
  const { activeCaptionSrc, isUserScrolling } = useViewerState();

  const tracks = captionResources ?? [];
  const hasChoice = tracks.length > 1;

  /**
   * Hold the transcript still while the language list is open.
   *
   * The panel re-centres itself on the cue being spoken 1.5s after the reader stops scrolling.
   * That is right when they are reading along and wrong when they are reaching for a control in
   * the same panel: the list slides away mid-reach, the click lands on whatever moved into its
   * place, and the menu never opens.
   *
   * Two flags are needed, and they are the same pair `Cue.tsx` already sets around its own
   * scrolling. `isUserScrolling` is what stops a cue from scrolling the panel; `isAutoScrolling`
   * is what stops the panel's scroll handler from treating movement as the reader scrolling and
   * re-arming the 1.5s expiry, which would otherwise overwrite the hold a moment later.
   *
   * The hold carries a timer so an abandoned one always expires, and closing the list hands
   * control straight back.
   */
  const scrollHold = React.useRef<number>();

  const releaseScroll = React.useCallback(() => {
    window.clearTimeout(scrollHold.current);
    scrollHold.current = undefined;
    dispatch({ type: "updateUserScrolling", isUserScrolling: undefined });
    dispatch({ type: "updateAutoScrolling", isAutoScrolling: false });
  }, [dispatch]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        releaseScroll();
        return;
      }

      window.clearTimeout(scrollHold.current);
      window.clearTimeout(isUserScrolling);

      scrollHold.current = window.setTimeout(
        releaseScroll,
        SCROLL_HOLD_TIMEOUT,
      );

      dispatch({
        type: "updateUserScrolling",
        isUserScrolling: scrollHold.current,
      });
      dispatch({ type: "updateAutoScrolling", isAutoScrolling: true });
    },
    [dispatch, isUserScrolling, releaseScroll],
  );

  React.useEffect(() => () => window.clearTimeout(scrollHold.current), []);

  /**
   * Which transcript to render.
   *
   * The selection is shared with the player, so choosing Italian in the captions menu moves
   * the transcript with it. It is *only* a selection though — the player switching its
   * overlay off says nothing about which transcript the reader wants to navigate, so nothing
   * here reads the on/off state.
   */
  const selectedSrc =
    (activeCaptionSrc &&
      tracks.some((track) => track.id === activeCaptionSrc) &&
      activeCaptionSrc) ||
    tracks[0]?.id ||
    vttUri;

  const [cues, setCues] = React.useState<Array<NodeWebVttCueNested>>(
    inlineCues ? inlineCues : [],
  );
  const { createNestedCues, orderCuesByTime, parseVttData } = useWebVtt();
  const [isNetworkError, setIsNetworkError] = React.useState<Error>();

  useEffect(
    () => {
      if (inlineCues || !selectedSrc) return;

      /**
       * Only the newest request may write.
       *
       * Switching language twice in quick succession leaves two fetches in flight, and they
       * do not necessarily land in the order they were sent. Without this the slower one wins
       * and the transcript shows a language the picker says is not selected — a disagreement
       * that never corrects itself, because nothing re-fetches.
       *
       * Aborting handles the request; the flag is still needed because parsing is a second
       * async hop, which a response that already arrived will reach regardless.
       */
      const controller = new AbortController();
      let superseded = false;

      setIsNetworkError(undefined);
      fetch(selectedSrc, {
        redirect: "follow",
        headers: {
          Accept: "text/vtt, text/plain, */*",
        },
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then((data) => {
          parseVttData(data).then((flatCues) => {
            if (superseded) return;
            const orderedCues = orderCuesByTime(flatCues);
            const nestedCues = createNestedCues(orderedCues);
            setCues(nestedCues);
          });
        })
        .catch((error) => {
          // An abort is this effect tidying up after itself, not a failure to report.
          if (superseded || error?.name === "AbortError") return;
          console.error(selectedSrc, error.toString());
          setIsNetworkError(error);
        });

      return () => {
        superseded = true;
        controller.abort();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSrc, inlineCues],
  ); // NOTE: Do not include createNestedCues and orderCuesByTime in the dependency array as it will cause an infinite loop

  return (
    <div className="clover-viewer-vtt">
      {hasChoice && (
        <div
          className="clover-viewer-vtt-tracks"
          data-testid="annotation-item-vtt-tracks"
        >
          {/*
            The same dropdown a painting `Choice` and a Collection use. A row of toggles grew
            a line at a time as a Manifest offered more languages, reflowing the transcript
            under it; a dropdown is one control at one height however many tracks there are.
          */}
          <Select
            label={{ none: [t("playerCaptions")] }}
            maxHeight="200px"
            onOpenChange={handleOpenChange}
            onValueChange={(activeCaptionSrc) =>
              dispatch({ type: "updateActiveCaptionSrc", activeCaptionSrc })
            }
            value={selectedSrc}
          >
            {tracks.map((track, index) => (
              <SelectOption
                key={track.id}
                label={{ none: [labelFor(track, index)] }}
                value={track.id as string}
              />
            ))}
          </Select>
        </div>
      )}

      <RadioGroup.Root
        className="clover-viewer-vtt-cues"
        data-testid="annotation-item-vtt"
        aria-label={`${getLabel(label as InternationalString)}`}
      >
        {isNetworkError && (
          <div data-testid="error-message">
            Network Error: {isNetworkError.toString()}
          </div>
        )}
        <Menu items={cues} />
      </RadioGroup.Root>
    </div>
  );
};

export default AnnotationItemVTT;
