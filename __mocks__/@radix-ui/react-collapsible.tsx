// Mock a react component from a 3rd party library for Vitest below.  It returns two child components, Content and Trigger based off the code below.

import React from "react";

export const Collapsible = () => {
  return <div data-testid="mock-collapsible">Collapsible</div>;
};

type CollapsibleContentProps = {
  displayName?: string;
};

const Content: React.FC<CollapsibleContentProps> = () => {
  return <div data-testid="mock-collapsible-content">Collapsible Content</div>;
};
Content.displayName = "CollapsibleContent";

const Trigger: React.FC<CollapsibleContentProps> = () => {
  return <div data-testid="mock-collapsible-trigger">Collapsible Trigger</div>;
};
Trigger.displayName = "CollapsibleTrigger";

Collapsible.Content = Content;
Collapsible.Trigger = Trigger;

export default Collapsible;
