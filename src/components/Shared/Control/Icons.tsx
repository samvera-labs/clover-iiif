import React from "react";

/*
 * The Slider and the Viewer's media strip each drew these from their own file with
 * byte-identical path data, and the Slider's pair hardcoded English `<title>` text that a
 * translated `aria-label` on the button overrode anyway. One copy, and the accessible name
 * is the button's job — these are decoration.
 */
const PreviousIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      strokeWidth="45"
      d="M244 400L100 256l144-144M120 256h292"
    />
  </svg>
);

const NextIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      strokeWidth="45"
      d="M268 112l144 144-144 144M392 256H100"
    />
  </svg>
);

const SearchIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M456.69 421.39L362.6 327.3a173.81 173.81 0 0034.84-104.58C397.44 126.38 319.06 48 222.72 48S48 126.38 48 222.72s78.38 174.72 174.72 174.72A173.81 173.81 0 00327.3 362.6l94.09 94.09a25 25 0 0035.3-35.3zM97.92 222.72a124.8 124.8 0 11124.8 124.8 124.95 124.95 0 01-124.8-124.8z" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z" />
  </svg>
);

export { CloseIcon, NextIcon, PreviousIcon, SearchIcon };
