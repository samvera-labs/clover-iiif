import React, { useContext, useEffect, useRef } from "react";
import {
  StyledSearchBackButton,
  StyledSearchForm,
  StyledSearchIcon,
  StyledSearchInput,
} from "src/components/Scroll/Panel/Search/Search.styled";

import { ScrollContext } from "src/context/scroll-context";

const SearchIcon: React.FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <title>Search</title>
      <path d="M456.69 421.39L362.6 327.3a173.81 173.81 0 0034.84-104.58C397.44 126.38 319.06 48 222.72 48S48 126.38 48 222.72s78.38 174.72 174.72 174.72A173.81 173.81 0 00327.3 362.6l94.09 94.09a25 25 0 0035.3-35.3zM97.92 222.72a124.8 124.8 0 11124.8 124.8 124.95 124.95 0 01-124.8-124.8z" />
    </svg>
  );
};

const CloseIcon: React.FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <title>Close</title>
      <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z" />
    </svg>
  );
};

interface PanelToggleProps {
  togglePanel: (isPanelExpanded: boolean) => void;
  isPanelExpanded: boolean;
}

const PanelToggle: React.FC<PanelToggleProps> = ({
  togglePanel,
  isPanelExpanded,
}) => {
  const { dispatch, state } = useContext(ScrollContext);
  const { searchString } = state;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () =>
    inputRef.current === document.activeElement && togglePanel(true);

  const focusInput = () => inputRef?.current?.focus();

  const blurInput = () => {
    inputRef.current?.blur();
    clearInput();
    togglePanel(false);
    dispatch({
      payload: "",
      type: "updateSearchString",
    });
  };

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClose = (e) => {
    e.preventDefault();
    blurInput();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      blurInput();
    }
  };

  useEffect(() => {
    document?.addEventListener("keydown", handleKeyDown);

    return () => {
      document?.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!inputRef?.current) return;

    inputRef.current.addEventListener("focus", handleFocus);
    inputRef.current.addEventListener("blur", handleFocus);

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener("focus", handleFocus);
        inputRef.current.removeEventListener("blur", handleFocus);
      }
    };
  }, []);

  const handleSearchChange = (e) => {
    dispatch({
      payload: e?.target?.value,
      type: "updateSearchString",
    });
  };

  return (
    <StyledSearchForm
      id="scroll-search"
      autoComplete="off"
      isPanelExpanded={isPanelExpanded}
    >
      <StyledSearchIcon onClick={focusInput}>
        <SearchIcon />
      </StyledSearchIcon>
      <StyledSearchInput
        ref={inputRef}
        name="clover-search"
        type="text"
        placeholder="Search..."
        defaultValue={searchString}
        onChange={handleSearchChange}
      />
      <StyledSearchBackButton
        aria-disabled={!isPanelExpanded}
        aria-label="Close search panel"
        onClick={handleClose}
        disabled={!isPanelExpanded}
      >
        <CloseIcon />
      </StyledSearchBackButton>
    </StyledSearchForm>
  );
};

export default PanelToggle;
