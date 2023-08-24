import * as Popover from "@radix-ui/react-popover";

import { keyframes, styled } from "src/styles/stitches.config";

const slideDown = keyframes({
  "0%": { opacity: 0, transform: "translateY(1rem)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideUp = keyframes({
  "0%": { opacity: 0, transform: "translateY(1rem)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const StyledArrow = styled(Popover.Arrow, {
  fill: "$secondaryAlt",
});

const StyledClose = styled(Popover.Close, {
  position: "absolute",
  right: "0",
  top: "0",
  padding: "0.5rem",
  margin: "0",
  cursor: "pointer",
  border: "none",
  background: "none",
  fill: "inherit",

  "&:hover": {
    opacity: "0.75",
  },
});

const StyledContent = styled(Popover.Content, {
  border: "none",
  backgroundColor: "white",
  fill: "inhrerit",
  padding: "1rem 2rem 1rem 1rem",
  width: "auto",
  minWidth: "200px",
  maxWidth: "350px",
  borderRadius: "3px",
  boxShadow: "5px 5px 13px #0002",

  /**
   * Animate toggle
   */
  animationDuration: "0.3s",
  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  '&[data-side="top"]': { animationName: slideUp },
  '&[data-side="bottom"]': { animationName: slideDown },

  /**
   *
   */
  '&[data-align="end"]': {
    [`& ${StyledArrow}`]: {
      margin: "0 0.7rem",
    },
  },
});

const StyledTrigger = styled(Popover.Trigger, {
  display: "inline-flex",
  padding: "0.5rem 0",
  margin: "0 0.5rem 0 0",
  cursor: "pointer",
  border: "none",
  background: "none",

  "> button, > span": {
    margin: "0",
  },
});

const StyledPopover = styled(Popover.Root, {
  boxSizing: "content-box",
});

export {
  StyledArrow,
  StyledClose,
  StyledContent,
  StyledPopover,
  StyledTrigger,
};
