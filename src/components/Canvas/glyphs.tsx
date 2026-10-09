import React from "react";

/*
 * Glyphs for `Canvas`'s own controls, drawn like `Image/Controls/glyphs.tsx`: a 512 box,
 * taking the button's colour.
 */

/**
 * A solid speech bubble with two lines of "text": the annotations control.
 *
 * The lines are holes (`evenodd`), not a second colour, so they always show the button's
 * own background through them, at rest and inverted on hover alike.
 */
export const Comment = () => (
  <path
    fillRule="evenodd"
    stroke="none"
    d="M144 72H368A96 96 0 0 1 464 168V296A96 96 0 0 1 368 392H200L104 460L144 392A96 96 0 0 1 48 296V168A96 96 0 0 1 144 72Z M168 184H344A16 16 0 0 1 344 216H168A16 16 0 0 1 168 184Z M168 264H280A16 16 0 0 1 280 296H168A16 16 0 0 1 168 264Z"
  />
);

/** A serifed lower-case `i`: the information control. */
export const Information = () => (
  <path
    stroke="none"
    d="M256 72A48 48 0 1 1 256 168A48 48 0 1 1 256 72Z M192 216H296V384H328V432H184V384H216V264H192Z"
  />
);

/** A cross, drawn as `ZoomIn` is: closes the caption. */
export const Close = () => (
  <path
    strokeLinecap="round"
    strokeWidth="45"
    d="M154 154L358 358M358 154L154 358"
  />
);
