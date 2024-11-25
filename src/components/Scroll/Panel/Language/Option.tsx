import React, { useContext } from "react";
import {
  StyledScrollLanguageOption,
  StyledScrollLanguageOptionCheckbox,
  StyledScrollLanguageOptionIndicator,
} from "./Language.styled";

import { ScrollContext } from "src/context/scroll-context";

const LanguageOption = ({
  lang,
  isChecked,
}: {
  lang: string;
  isChecked?: boolean;
}) => {
  const { state, dispatch } = useContext(ScrollContext);
  const { activeLanguages, options } = state;
  const { language } = options;

  // check if lang set in language.options
  const hasOption =
    language?.options?.find((option) => Object.keys(option)[0] === lang) ||
    lang;

  // set label
  const label = hasOption[lang] || lang;

  const handleCheckedChange = (checked: boolean) => {
    const updatedLanguages =
      checked && activeLanguages !== undefined
        ? [...activeLanguages, lang]
        : activeLanguages?.filter((language) => language !== lang);

    dispatch({
      type: "updateActiveLanguages",
      payload: updatedLanguages,
    });
  };

  return (
    <StyledScrollLanguageOption
      checked={isChecked}
      onCheckedChange={handleCheckedChange}
    >
      <StyledScrollLanguageOptionCheckbox>
        <StyledScrollLanguageOptionIndicator>
          ✓
        </StyledScrollLanguageOptionIndicator>
      </StyledScrollLanguageOptionCheckbox>
      {label}
    </StyledScrollLanguageOption>
  );
};

export default LanguageOption;
