import {
  Range,
  RangeItems,
} from "@iiif/presentation-3";
import React from "react";

interface PropertiesRangeProps {
  id: string;
  htmlLabel: string;
  ascii: string;
  items: any[];
}

const PropertiesRange: React.FC<PropertiesRangeProps> = ({
  id,
  htmlLabel,
  ascii,
  items,
}) => {
  return (
    <>
      <span className="manifest-property-title">{htmlLabel}</span><br/>
      <span><strong>RangeId:</strong> {id}</span><br/><br/>
      <pre>{ascii}</pre><br/><br/>
      <span><strong>Range Items Dump:</strong></span><br/><br/>
      <pre>{JSON.stringify(items)}</pre>
    </>
  );
};

export default PropertiesRange;
