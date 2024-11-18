import React, { CSSProperties, useContext, useRef } from "react";
import {
  StyledScrollFixed,
  StyledScrollPanel,
} from "src/components/Scroll/Layout/Layout.styled";

import { ScrollContext } from "src/context/scroll-context";
import ScrollSearchResults from "src/components/Scroll/Panel/Search/Search";
import SearchForm from "src/components/Scroll/Panel/Search/Form";
import { StyledPanel } from "src/components/Scroll/Panel/Panel.styled";

const ScrollPanel = ({ width, isFixed }) => {
  const scrollAsideRef = useRef<HTMLDivElement>(null);
  const [isPanelExpanded, setPanelExpanded] = React.useState(false);

  const { state } = useContext(ScrollContext);
  const { options } = state;
  const { offset } = options;

  const fixedStyles: CSSProperties = isFixed
    ? {
        position: "fixed",
        top: isFixed ? offset : 0,
      }
    : {};

  function handlePanel(e) {
    setPanelExpanded(e);
  }

  return (
    <StyledScrollPanel
      ref={scrollAsideRef}
      data-testid="scroll-panel"
      style={{
        left: isPanelExpanded
          ? "unset"
          : isFixed
            ? "unset"
            : `calc(${width}px - 2rem)`,
        marginLeft: isPanelExpanded
          ? `-${width}px`
          : isFixed
            ? "-2rem"
            : `unset`,
        width: isPanelExpanded ? width : "2rem",
        ...fixedStyles,
      }}
    >
      <StyledScrollFixed>
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
    </StyledScrollPanel>
  );
};

export default ScrollPanel;
