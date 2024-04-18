import React, { useContext, useRef } from "react";
import {
  StyledScrollAside,
  StyledScrollFixed,
} from "src/components/Scroll/Layout/Layout.styled";

import { ScrollContext } from "src/context/scroll-context";
import ScrollSearchResults from "src/components/Scroll/Panel/Search/Search";
import SearchForm from "src/components/Scroll/Panel/Search/Form";
import { StyledPanel } from "src/components/Scroll/Panel/Panel.styled";
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
          {isPanelExpanded && <ScrollSearchResults />}
        </StyledPanel>
      </StyledScrollFixed>
    </StyledScrollAside>
  );
};

export default ScrollPanel;
