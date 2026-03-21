import * as PopoverPrimitive from "@radix-ui/react-popover";

import { Icon } from "../Icon/Icon";
import React from "react";
import {
  popoverArrow,
  popoverClose,
  popoverContent,
  popoverTrigger,
} from "./Popover.css";

/**
 *
 */
type TriggerShape = {
  children: React.ReactNode;
  "aria-controls"?: string;
};

type TriggerProps = React.ComponentProps<typeof PopoverPrimitive.Trigger> &
  TriggerShape;

const Trigger: React.FC<TriggerProps> = ({ children, className, ...rest }) => {
  const classes = [popoverTrigger, className].filter(Boolean).join(" ");
  return (
    <PopoverPrimitive.Trigger {...rest} className={classes}>
      {children}
    </PopoverPrimitive.Trigger>
  );
};

/**
 *
 */
type ContentShape = {
  children: React.ReactNode | React.ReactNode[];
  id?: string;
};

type ContentProps = React.ComponentProps<typeof PopoverPrimitive.Content> &
  ContentShape;

const Content: React.FC<ContentProps> = ({
  children,
  className,
  collisionPadding = 21,
  sideOffset = 5,
  ...rest
}) => {
  const classes = [popoverContent, className].filter(Boolean).join(" ");

  return (
    <PopoverPrimitive.Content
      {...rest}
      className={classes}
      collisionPadding={collisionPadding}
      sideOffset={sideOffset}
    >
      <PopoverPrimitive.Arrow
        className={["popover-arrow", popoverArrow].join(" ")}
      />
      <PopoverPrimitive.Close className={popoverClose} aria-label="Close">
        <Icon isSmall>
          <Icon.Close />
        </Icon>
      </PopoverPrimitive.Close>
      {children}
    </PopoverPrimitive.Content>
  );
};

/**
 *
 */
type PopoverShape = {
  children: React.ReactChild | React.ReactChild[];
};

interface PopoverComposition {
  Content: React.FC<ContentProps>;
  Trigger: React.FC<TriggerProps>;
}

type PopoverProps = PopoverPrimitive.PopoverProps & PopoverShape;

const Popover: React.FC<PopoverProps> & PopoverComposition = ({
  children,
  ...rest
}) => {
  return <PopoverPrimitive.Root {...rest}>{children}</PopoverPrimitive.Root>;
};

Popover.Trigger = Trigger;
Popover.Content = Content;

export { Popover };
