import React, { CSSProperties, useContext, useRef } from "react";
import {
  StyledScrollPanel,
  StyledScrollSearch,
} from "src/components/Scroll/Layout/Layout.styled";

import { ScrollContext } from "src/context/scroll-context";
import ScrollLanguage from "./Language/Language";
import ScrollSearchResults from "src/components/Scroll/Panel/Search/Search";
import SearchForm from "src/components/Scroll/Panel/Search/Form";
import { StyledPanel } from "src/components/Scroll/Panel/Panel.styled";

const ScrollPanel = ({ width, isFixed }) => {
  const scrollAsideRef = useRef<HTMLDivElement>(null);
  const [isPanelExpanded, setPanelExpanded] = React.useState(false);

  const { state } = useContext(ScrollContext);
  const { options } = state;
  const { offset, language } = options;

  const fixedStyles: CSSProperties = isFixed
    ? {
        position: "fixed",
        top: isFixed ? offset : 0,
      }
    : {};

  function handlePanel(e) {
    setPanelExpanded(e);
  }

  const languageFilterable = language?.filterable;
  const controlsWidth = languageFilterable ? 4.5 : 2;

  return (
    <StyledScrollPanel
      ref={scrollAsideRef}
      data-testid="scroll-panel"
      style={{
        display: isPanelExpanded ? "unset" : "inline-flex",
        left: isPanelExpanded
          ? "unset"
          : isFixed
            ? "unset"
            : `calc(${width}px - ${controlsWidth}rem)`,
        marginLeft: isPanelExpanded
          ? `-${width}px`
          : isFixed
            ? `-${controlsWidth}rem`
            : `unset`,
        width: isPanelExpanded ? width : `${controlsWidth}rem`,
        ...fixedStyles,
      }}
    >
      {!isPanelExpanded && languageFilterable && <ScrollLanguage />}
      <StyledScrollSearch>
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
      </StyledScrollSearch>
    </StyledScrollPanel>
  );
};

export default ScrollPanel;
