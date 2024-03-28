import React, { useContext, useRef } from "react";
import { StyledScrollAside, StyledScrollFixed } from "../Layout/Layout.styled";

import { ScrollContext } from "src/context/scroll-context";
import ScrollSearchResults from "./Search/Results";
import SearchForm from "./Search/Form";
import { StyledPanel } from "./Panel.styled";
import { useDistanceFromViewportTop } from "src/hooks/useDistanceFromViewportTop";

interface ScrollToggleProps {
  isPanelExpanded: boolean;
  handlePanel: (status: boolean) => void;
}

const ScrollPanel: React.FC<ScrollToggleProps> = ({
  isPanelExpanded,
  handlePanel,
}) => {
  const scrollAsideRef = useRef<HTMLDivElement>(null);

  const { state } = useContext(ScrollContext);
  const { options } = state;
  const { offset } = options;

  const { top } = useDistanceFromViewportTop(scrollAsideRef);
  const isAnchored = top ? top < offset : false;
  const articleWidth = scrollAsideRef?.current?.offsetWidth;
  const panelWidth = articleWidth ? articleWidth * 0.5 : articleWidth;
  const defaultFormWidth = panelWidth ? panelWidth - 315 : 180;

  const fixedStyles = {
    top: isAnchored ? offset : 0,
    width: `calc(${panelWidth}px - 1.318rem)`,
    maxWidth: isPanelExpanded ? "100%" : `${defaultFormWidth}px`,
    minWidth: "130px",
  };

  return (
    <StyledScrollAside
      ref={scrollAsideRef}
      className={isAnchored ? "anchor" : ""}
      data-testid="scroll-panel"
    >
      <StyledScrollFixed style={fixedStyles}>
        <SearchForm
          togglePanel={handlePanel}
          isPanelExpanded={isPanelExpanded}
        />
        <StyledPanel
          data-testid="scroll-panel-results"
          data-panel-expanded={isPanelExpanded}
          isPanelExpanded={isPanelExpanded}
        >
          <ScrollSearchResults isPanelExpanded={isPanelExpanded} />
        </StyledPanel>
      </StyledScrollFixed>
    </StyledScrollAside>
  );
};

export default ScrollPanel;
