import React, { useEffect } from "react";
import useWebVtt, { NodeWebVttCueNested } from "src/hooks/use-webvtt";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

import * as RadioGroup from "@radix-ui/react-radio-group";
import { InternationalString } from "@iiif/presentation-3";
import Menu from "src/components/Viewer/InformationPanel/Menu";
import { getLabel } from "src/hooks/use-iiif";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

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
  const { activeCaptionSrc } = useViewerState();

  const tracks = captionResources ?? [];
  const hasChoice = tracks.length > 1;

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
      if (!inlineCues && selectedSrc) {
        setIsNetworkError(undefined);
        fetch(selectedSrc, {
          redirect: "follow",
          headers: {
            Accept: "text/vtt, text/plain, */*",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
          })
          .then((data) => {
            parseVttData(data).then((flatCues) => {
              const orderedCues = orderCuesByTime(flatCues);
              const nestedCues = createNestedCues(orderedCues);
              setCues(nestedCues);
            });
          })
          .catch((error) => {
            console.error(selectedSrc, error.toString());
            setIsNetworkError(error);
          });
      }
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
          <span className="clover-viewer-vtt-tracks-label">
            {t("playerCaptions")}
          </span>
          {tracks.map((track, index) => (
            <button
              aria-pressed={track.id === selectedSrc}
              className="clover-viewer-vtt-track"
              key={track.id}
              onClick={() =>
                dispatch({
                  type: "updateActiveCaptionSrc",
                  activeCaptionSrc: track.id,
                })
              }
              type="button"
            >
              {labelFor(track, index)}
            </button>
          ))}
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
