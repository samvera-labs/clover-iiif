import { ContentState, encodeContentState } from "@iiif/helpers";
import {
  StyledIIIFContentState,
  StyledIIIFContentStateActiveFile,
  StyledIIIFContentStateButton,
  StyledIIIFContentStateInner,
  StyledIIIFContentStateOptions,
  StyledIIIFContentStateURI,
} from "./ContentState.styled";
import { useEffect, useRef, useState } from "react";

import { Label } from "@samvera/clover-iiif/primitives";

interface IIIFContentStateProps {
  contentState: ContentState;
}

const ShareContentState: React.FC<IIIFContentStateProps> = ({
  contentState,
}) => {
  console.log(contentState);

  const [isCurrentCanvas, setIsCurrentCanvas] = useState(true);

  const uri = new URL(window.location.href);

  if (isCurrentCanvas)
    uri.searchParams.set("iiif-content", encodeContentState(contentState));

  return <StyledIIIFContentState>{uri.toString()}</StyledIIIFContentState>;
};

export default ShareContentState;
