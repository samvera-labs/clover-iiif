import React from "react";
import Button from "./Button";
import { Wrapper } from "./Controls.styled";

const Controls: React.FC = () => {
  const ZoomIn = () => {
    return (
      <path
        strokeLinecap="round"
        strokeMiterlimit="10"
        strokeWidth="45"
        d="M256 112v288M400 256H112"
      />
    );
  };

  const ZoomOut = () => {
    return (
      <path
        strokeLinecap="round"
        strokeMiterlimit="10"
        strokeWidth="45"
        d="M400 256H112"
      />
    );
  };

  const ZoomReset = () => {
    return (
      <>
        <path
          fill="none"
          strokeLinecap="round"
          strokeMiterlimit="10"
          strokeWidth="45"
          d="M400 148l-21.12-24.57A191.43 191.43 0 00240 64C134 64 48 150 48 256s86 192 192 192a192.09 192.09 0 00181.07-128"
        />
        <path d="M464 97.42V208a16 16 0 01-16 16H337.42c-14.26 0-21.4-17.23-11.32-27.31L436.69 86.1C446.77 76 464 83.16 464 97.42z" />
      </>
    );
  };

  return (
    <Wrapper data-testid="openseadragon-controls" id="openseadragon-controls">
      <Button id="zoomIn" label="zoom in">
        <ZoomIn />
      </Button>
      <Button id="zoomOut" label="zoom in">
        <ZoomOut />
      </Button>
      <Button id="zoomReset" label="reset zoom">
        <ZoomReset />
      </Button>
    </Wrapper>
  );
};

export default Controls;
