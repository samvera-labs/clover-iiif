import {
  Range,
  RangeItems,
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

interface PropertiesRangeProps {
  items: any[];
}

const PropertiesRange: React.FC<PropertiesRangeProps> = ({
  items,
}) => {
  const dispatch: any = useViewerDispatch();
  const state: ViewerContextStore = useViewerState();
  const { activeCanvas, vault } = state;
  const handleChange = (canvasId: string) => {
    console.log(canvasId)
    if (activeCanvas !== canvasId)
      // dispatch({
      //   type: "updateActiveCanvas",
      //   canvasId: canvasId,
      // });
      console.log(canvasId)
  };

  return (
    <ul>
        {items.map((item)=> {
          return(
            <li key={item.id}>
              {item.isCanvasLeaf &&
                <a onClick={() => handleChange(item.id)}>{getValue(item.label)}</a>
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
