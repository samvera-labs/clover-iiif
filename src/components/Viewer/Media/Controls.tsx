import {
  Button,
  Direction,
  Form,
  Input,
  Wrapper,
} from "src/components/Viewer/Media/Controls.styled";
import React, { useEffect, useState } from "react";

import useKeyPress from "src/hooks/useKeyPress";
import { useTranslation } from "react-i18next";

interface ControlsProps {
  handleCanvasToggle: (arg0: -1 | 1) => void;
  handleFilter: (arg0: string) => void;
  activeIndex: number;
  canvasLength: number;
}

const PreviousIcon = ({ title }: { title: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <title>{title}</title>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="45"
        d="M244 400L100 256l144-144M120 256h292"
      />
    </svg>
  );
};

const NextIcon = ({ title }: { title: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <title>{title}</title>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="45"
        d="M268 112l144 144-144 144M392 256H100"
      />
    </svg>
  );
};

const CloseIcon = ({ title }: { title: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <title>{title}</title>
      <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z" />
    </svg>
  );
};

const SearchIcon = ({ title }: { title: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <title>{title}</title>
      <path d="M456.69 421.39L362.6 327.3a173.81 173.81 0 0034.84-104.58C397.44 126.38 319.06 48 222.72 48S48 126.38 48 222.72s78.38 174.72 174.72 174.72A173.81 173.81 0 00327.3 362.6l94.09 94.09a25 25 0 0035.3-35.3zM97.92 222.72a124.8 124.8 0 11124.8 124.8 124.95 124.95 0 01-124.8-124.8z" />
    </svg>
  );
};

const Controls: React.FC<ControlsProps> = ({
  handleCanvasToggle,
  handleFilter,
  activeIndex,
  canvasLength,
}) => {
  const [toggleFilter, setToggleFilter] = useState<boolean>(false);
  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false);
  const [isPreviousDisabled, setIsPreviousDisabled] = useState<boolean>(false);

  const { t } = useTranslation();

  useEffect(() => {
    activeIndex === 0
      ? setIsPreviousDisabled(true)
      : setIsPreviousDisabled(false);
    activeIndex === canvasLength - 1
      ? setIsNextDisabled(true)
      : setIsNextDisabled(false);
  }, [activeIndex, canvasLength]);

  /**
   * dismiss filtering if Escape key is pressed
   */
  useKeyPress("Escape", () => {
    setToggleFilter(false);
    handleFilter("");
  });

  /**
   * reset filtering on manual toggle button press
   */
  const handleFilterToggle = () => {
    setToggleFilter((prevToggleFilter) => !prevToggleFilter);
    handleFilter("");
  };

  /**
   * handle value changes on Input
   */
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    handleFilter(event.target.value);

  return (
    <Wrapper isToggle={toggleFilter}>
      <Form>
        {toggleFilter && (
          <Input
            autoFocus
            onChange={handleFilterChange}
            placeholder={t("commonSearchPlaceholder")}
          />
        )}
        {!toggleFilter && (
          <Direction>
            <Button
              onClick={() => handleCanvasToggle(-1)}
              disabled={isPreviousDisabled}
              type="button"
            >
              <PreviousIcon title={t("commonPrevious")} />
            </Button>
            <span>
              {activeIndex + 1} <em>/</em> {canvasLength}
            </span>
            <Button
              onClick={() => handleCanvasToggle(1)}
              disabled={isNextDisabled}
              type="button"
            >
              <NextIcon title={t("commonNext")} />
            </Button>
          </Direction>
        )}
        <Button
          onClick={handleFilterToggle}
          type="button"
          className="clover-viewer-media-search"
        >
          {toggleFilter ? (
            <CloseIcon title={t("commonClose")} />
          ) : (
            <SearchIcon title={t("commonSearch")} />
          )}
        </Button>
      </Form>
    </Wrapper>
  );
};

export default Controls;
