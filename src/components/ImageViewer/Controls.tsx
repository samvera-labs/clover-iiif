import React from "react";
import Button from "@/components/ImageViewer/Button";
import { Options } from "openseadragon";
import { Wrapper } from "@/components/ImageViewer/Controls.styled";

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

const ZoomFullScreen = () => {
  return (
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
      d="M432 320v112H320M421.8 421.77L304 304M80 192V80h112M90.2 90.23L208 208M320 80h112v112M421.77 90.2L304 208M192 432H80V320M90.23 421.8L208 304"
    />
  );
};

const Reset = () => {
  return (
    <path d="M448 440a16 16 0 01-12.61-6.15c-22.86-29.27-44.07-51.86-73.32-67C335 352.88 301 345.59 256 344.23V424a16 16 0 01-27 11.57l-176-168a16 16 0 010-23.14l176-168A16 16 0 01256 88v80.36c74.14 3.41 129.38 30.91 164.35 81.87C449.32 292.44 464 350.9 464 424a16 16 0 01-16 16z" />
  );
};

const Rotate = () => {
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

const Controls = ({
  hasPlaceholder,
  options,
}: {
  hasPlaceholder: boolean;
  options: Options;
}) => {
  return (
    <Wrapper
      data-testid="openseadragon-controls"
      hasPlaceholder={hasPlaceholder}
      id="openseadragon-controls"
    >
      {options.showZoomControl && (
        <>
          <Button id="zoomIn" label="zoom in">
            <ZoomIn />
          </Button>
          <Button id="zoomOut" label="zoom out">
            <ZoomOut />
          </Button>
        </>
      )}
      {options.showFullPageControl && (
        <Button id="fullPage" label="full page">
          <ZoomFullScreen />
        </Button>
      )}
      {options.showRotationControl && (
        <>
          <Button id="rotateRight" label="rotate right">
            <Rotate />
          </Button>
          <Button id="rotateLeft" label="rotate left">
            <Rotate />
          </Button>
        </>
      )}
      {options.showHomeControl && (
        <Button id="reset" label="reset">
          <Reset />
        </Button>
      )}
    </Wrapper>
  );
};

export default Controls;
