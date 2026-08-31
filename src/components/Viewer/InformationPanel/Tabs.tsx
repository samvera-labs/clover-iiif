import * as RadixTabs from "@radix-ui/react-tabs";

import React, { ReactNode } from "react";

import { join } from "src/lib/classnames";

/**
 * The information panel's tab chrome.
 *
 * These are thin wrappers that attach Clover's class to a Radix primitive, the same shape
 * `UI/Popover` and `Shared/Control` use. They replaced `styled(Tabs.Root, …)` and friends,
 * and keeping the exported names means the panel's JSX did not have to change — which
 * matters here more than elsewhere, since `Trigger` and `Content` are rendered from a dozen
 * call sites with different props.
 *
 * `className` is merged rather than replaced, so a consumer can add one without erasing the
 * class the stylesheet keys on.
 */

type RootProps = React.ComponentPropsWithoutRef<typeof RadixTabs.Root>;
const Wrapper: React.FC<RootProps> = ({ className, ...rest }) => (
  <RadixTabs.Root
    {...rest}
    className={join("clover-viewer-information-panel", className)}
  />
);

type ListProps = React.ComponentPropsWithoutRef<typeof RadixTabs.List>;
const List: React.FC<ListProps> = ({ className, ...rest }) => (
  <RadixTabs.List
    {...rest}
    className={join("clover-viewer-information-panel-tabs", className)}
  />
);

type TriggerProps = React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>;
const Trigger: React.FC<TriggerProps> = ({ className, ...rest }) => (
  <RadixTabs.Trigger
    {...rest}
    className={join("clover-viewer-information-panel-tab", className)}
  />
);

type ContentProps = React.ComponentPropsWithoutRef<typeof RadixTabs.Content>;
const Content: React.FC<ContentProps> = ({ className, ...rest }) => (
  <RadixTabs.Content
    {...rest}
    className={join("clover-viewer-information-panel-content", className)}
  />
);

const MapTabBody: React.FC<{ children?: ReactNode }> = ({ children }) => (
  <div className="clover-viewer-map-tab-body">{children}</div>
);

/**
 * The scroll container. `handleScroll` rather than `onScroll` is the prop name the panel
 * already passed, kept so the call site is unchanged.
 */
const Scroll: React.FC<{
  handleScroll?: React.UIEventHandler<HTMLDivElement>;
  children?: ReactNode;
  className?: string;
}> = ({ handleScroll, children, className }) => (
  <div
    className={join("clover-viewer-information-panel-scroll", className)}
    onScroll={handleScroll}
  >
    {children}
  </div>
);

export { Content, List, MapTabBody, Scroll, Trigger, Wrapper };
