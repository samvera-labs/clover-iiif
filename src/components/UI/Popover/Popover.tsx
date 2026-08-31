import * as RadixPopover from "@radix-ui/react-popover";

import { Icon } from "../Icon/Icon";
import { join } from "src/lib/classnames";
import React from "react";

type TriggerProps = React.ComponentPropsWithoutRef<typeof RadixPopover.Trigger>;

const Trigger: React.FC<TriggerProps> = ({ children, className, ...rest }) => (
  <RadixPopover.Trigger
    {...rest}
    className={join("clover-popover-trigger", className)}
  >
    {children}
  </RadixPopover.Trigger>
);

type ContentProps = React.ComponentPropsWithoutRef<typeof RadixPopover.Content>;

const Content: React.FC<ContentProps> = ({ children, className, ...rest }) => (
  <RadixPopover.Content
    {...rest}
    className={join("clover-popover-content", className)}
    collisionPadding={21}
    sideOffset={5}
  >
    <RadixPopover.Arrow className="clover-popover-arrow" />
    <RadixPopover.Close className="clover-popover-close">
      <Icon isSmall>
        <Icon.Close />
      </Icon>
    </RadixPopover.Close>
    {children}
  </RadixPopover.Content>
);

interface PopoverComposition {
  Content: React.FC<ContentProps>;
  Trigger: React.FC<TriggerProps>;
}

type PopoverProps = {
  children: React.ReactNode;
};

const Popover: React.FC<PopoverProps> & PopoverComposition = ({ children }) => (
  <RadixPopover.Root>{children}</RadixPopover.Root>
);

Popover.Trigger = Trigger;
Popover.Content = Content;

export { Popover };
