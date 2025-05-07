import React, { useEffect, useRef, useState } from "react";

import { AutoScrollOptions } from "src/context/viewer-context";
import { Item } from "src/components/Viewer/InformationPanel/Annotation/VTT/Cue.styled";
import { convertTime } from "src/lib/utils";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";

const AutoScrollDisableTime = 750;

interface Props {
  html: string;
  text: string;
  start: number;
  end: number;
}

const findScrollableParent = (
  element: HTMLElement | null,
): HTMLElement | null => {
  while (element && element !== document.body) {
    const overflowY = window.getComputedStyle(element).overflowY;
    const isScrollable = overflowY !== "visible" && overflowY !== "hidden";

    if (isScrollable && element.scrollHeight > element.clientHeight) {
      return element;
    }

    element = element.parentNode as HTMLElement;
  }

  return null;
};

const Cue: React.FC<Props> = ({ html, text, start, end }) => {
  const dispatch: any = useViewerDispatch();
  const {
    configOptions,
    isAutoScrollEnabled,
    isUserScrolling,
  }: ViewerContextStore = useViewerState();
  const autoScrollOptions = configOptions?.informationPanel?.vtt
    ?.autoScroll as AutoScrollOptions;

  const [isActive, updateIsActive] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  const video = document.getElementById(
    "clover-iiif-video",
  ) as HTMLVideoElement;

  useEffect(() => {
    video?.addEventListener("timeupdate", () => {
      const { currentTime } = video;
      updateIsActive(start <= currentTime && currentTime < end);
    });

    return () => document.removeEventListener("timeupdate", () => {});
  }, [end, start, video]);

  useEffect(() => {
    const withAutoScrollDisabled = (func) => {
      dispatch({ type: "updateAutoScrolling", isAutoScrolling: true });
      func();
      setTimeout(
        () => dispatch({ type: "updateAutoScrolling", isAutoScrolling: false }),
        AutoScrollDisableTime,
      );
    };

    if (isAutoScrollEnabled && isActive && ref.current && !isUserScrolling) {
      /*
       * reimplement HTMLElement.scrollIntoView() block behaviors
       * using parent.scrollTo() to prevent outer element scrolling
       */

      const element = ref.current;
      if (element && element instanceof HTMLElement) {
        const parent = findScrollableParent(element);
        if (parent && parent instanceof HTMLElement) {
          let top;
          switch (autoScrollOptions?.settings?.block) {
            case "center":
              const parentRect = parent.getBoundingClientRect();
              top =
                element.offsetTop +
                element.offsetHeight -
                Math.floor((parentRect.bottom - parentRect.top) / 2);
              break;
            case "end":
              top =
                element.offsetTop +
                element.offsetHeight -
                (parent.clientHeight - element.clientHeight) +
                2;
              break;
            default:
              top = element.offsetTop - 2;
              break;
          }
          withAutoScrollDisabled(() =>
            parent.scrollTo({
              top,
              left: 0,
              behavior: autoScrollOptions?.settings?.behavior as ScrollBehavior,
            }),
          );
        }
      }
    }
  }, [
    autoScrollOptions,
    isActive,
    isUserScrolling,
    isAutoScrollEnabled,
    dispatch,
  ]);

  const handleClick = () => {
    if (video) {
      video.pause();
      video.currentTime = start;
      video.play();
    }
  };

  return (
    <Item
      ref={ref}
      aria-checked={isActive}
      data-testid="information-panel-cue"
      onClick={handleClick}
      value={text}
    >
      <div
        className="webvtt-cue"
        dangerouslySetInnerHTML={{ __html: html }}
      ></div>
      <strong>{convertTime(start)}</strong>
    </Item>
  );
};

export default Cue;
