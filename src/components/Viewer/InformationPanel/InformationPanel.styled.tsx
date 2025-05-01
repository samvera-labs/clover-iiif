import * as Tabs from "@radix-ui/react-tabs";
import * as Accordion from "@radix-ui/react-accordion";
import { styled } from "src/styles/stitches.config";
import { keyframes } from "@stitches/react";
import { ChevronDownIcon } from "@radix-ui/react-icons";

export const Wrapper = styled(Tabs.Root, {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",
  zIndex: "1",

  "@sm": {
    marginTop: "0.5rem",
    boxShadow: "none",
  },
});

export const AccordionRoot = styled(Accordion.Root, {
  borderRadius: "6px",
  boxShadow: "0 2px 10px var(--black-a4)",
  width: "300px",
  overflow: "auto",
  scrollbarWidth: "thin",
});

export const AccordionItem = styled(Accordion.Item, {
  overflow: "hidden",
  marginTop: "1px",
  "&::first-child": {
    marginTop: "0",
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
  },
  "&::last-child": {
    borderBottomLeftRadius: "4px",
    borderBottomRightRadius: "4px",
  },
  "&::focus-within": {
    position: "relative",
    zIndex: "1",
    boxShadow: "0 0 0 2px var(--mauve-12)",
  },
});

export const AccordionChevron = styled(ChevronDownIcon, {
  color: "var(--violet-10)",
  transition: "transform 300ms ease-in-out",
});

export const AccordionHeader = styled(Accordion.Header, {
  display: "flex",
});

export const AccordionTrigger = styled(Accordion.Trigger, {
  fontFamily: "inherit",
  padding: "0 20px",
  height: "45px",
  flex: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "15px",
  lineHeight: "1",
  color: "var(--violet-11)",
  boxShadow: "0 1px 0 var(--mauve-6)",
  backgroundColor: "var(--mauve-1)",
  "&:hover": {
    backgroundColor: "var(--mauve-2)",
  },
  '&[data-state="open"] > .AccordionChevron': {
    transform: "rotate(180deg)",
  },
});

const slideDown = keyframes({
  from: { height: "0" },
  to: { height: "var(--radix-accordion-content-height)" },
});

const slideUp = keyframes({
  from: { height: "var(--radix-accordion-content-height)" },
  to: { height: "0" },
});

export const AccordionContent = styled(Accordion.Content, {
  color: "var(--mauve-11)",
  backgroundColor: "var(--mauve-2)",
  '&[data-state="open"]': {
    animation: `${slideDown} 300ms ease-in-out`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 300ms ease-in-out`,
  },
});
