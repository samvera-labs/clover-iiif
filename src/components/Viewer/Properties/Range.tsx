import {
  Range,
  RangeItems,
  CanvasNormalized,
} from "@iiif/presentation-3";
import {
  getValue,
} from "@iiif/helpers"
import React, { useEffect, useState } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";
import {
  getActiveCanvas,
} from "src/lib/iiif";

interface PropertiesRangeProps {
  items: any[];
}

const PropertiesRange: React.FC<PropertiesRangeProps> = ({
  items,
}) => {
  const dispatch: any = useViewerDispatch();
  const state: ViewerContextStore = useViewerState();
  const { playerRef } = state;
  const { activeCanvas, vault } = state;

  const handleChange = (time: number) => {
    if (playerRef?.current) {
      playerRef.current.fastSeek(time);
    }
  };
  

  return (
    <ul>
        {items.map((item)=> {
          // it would probably be better to get the time from the canvase media fragment
          const match = item.id.match(/t=(\d+\.?\d*)/);
          const time = match ? Math.floor(match[1]) : null;
          return(
            <li key={item.id}>
              {item.isCanvasLeaf &&
                <a onClick={() => handleChange(time)}>{getValue(item.label)}</a>
              }
              {!item.isCanvasLeaf &&
                <span>{getValue(item.label)}</span>
              }
              {item.items && <PropertiesRange items={item.items} />}
            </li>
          );
          
        })}
    </ul>
  );
};

export default PropertiesRange;
