import {
  Range,
  RangeItems,
} from "@iiif/presentation-3";
import {
  getValue,
} from "@iiif/helpers"
import React from "react";

interface PropertiesRangeProps {
  items: any[];
}

const PropertiesRange: React.FC<PropertiesRangeProps> = ({
  items,
}) => {
  return (
    <ul>
        {items.map((item)=> {
          return(
            <li>
              <a href={item.id}>{getValue(item.label)}</a>
              {item.items && <PropertiesRange items={item.items} />}
            </li>
          );
          
        })}
    </ul>
  );
};

export default PropertiesRange;
