import React, { CSSProperties, useContext, useRef } from "react";

import { ScrollContext } from "src/context/scroll-context";
import ScrollLanguage from "./Language/Language";
import ScrollSearchResults from "src/components/Scroll/Panel/Search/Search";
import SearchForm from "src/components/Scroll/Panel/Search/Form";

const ScrollPanel = ({ width, isFixed, hasDefinedLanguages }) => {
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

  const languageEnabled = language?.enabled;
  const controlsWidth = languageEnabled ? 4.5 : 2;

  return (
    <div
      className="clover-scroll-panel"
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
      {!isPanelExpanded && languageEnabled && hasDefinedLanguages && (
        <ScrollLanguage />
      )}
      <div className="clover-scroll-search">
        <SearchForm
          togglePanel={handlePanel}
          isPanelExpanded={isPanelExpanded}
        />
        <div
          className="clover-scroll-panel-results"
          data-testid="scroll-panel-results"
          data-panel-expanded={isPanelExpanded}
        >
          {isPanelExpanded && <ScrollSearchResults />}
        </div>
      </div>
    </div>
  );
};

export default ScrollPanel;
