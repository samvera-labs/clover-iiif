import React from "react";
import { PrimitivesCustomValueContent } from "../types/primitives";

interface PrimitivesValueWrapperProps {
  value?: string;
}

const CustomValueDate: React.FC<PrimitivesValueWrapperProps> = (props) => (
  <a href={encodeURI(`https://example.org/?date=${props.value}`)}>
    {props.value}
  </a>
);

const CustomValueSubject: React.FC<PrimitivesValueWrapperProps> = (props) => (
  <a href={encodeURI(`https://example.org/?subject=${props.value}`)}>
    {props.value}
  </a>
);

const customValueContent: PrimitivesCustomValueContent[] = [
  {
    matchingLabel: { none: ["Date"] },
    Content: <CustomValueDate />,
  },
  {
    matchingLabel: { none: ["Subject"] },
    Content: <CustomValueSubject />,
  },
];

export { CustomValueSubject, customValueContent };
