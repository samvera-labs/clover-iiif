import React, { CSSProperties, useContext } from "react";

import LanguageOption from "./Option";
import { Popover } from "src/components/UI";
import { ScrollContext } from "src/context/scroll-context";
import { StyledScrollLanguage } from "./Language.styled";
import { extractLanguages } from "src/lib/annotation-helpers";

const LanguageIcon = ({
  title,
  style = {},
}: {
  title: string;
  style?: CSSProperties;
}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={style}>
      <title>{title}</title>
      <path d="m455.77,49.65c-.53-.94-1.53-1.52-2.61-1.52h-1.46c-.9,0-1.76.41-2.33,1.11-7.48,9.2-14.92,20.42-22.14,33.34-.49.87-.51,1.93-.05,2.82,14.51,28.46,28.67,57.32,28.8,70.41-.1.12-.38.35-.96.57-.05.02-.1.04-.15.06-11.86,5.21-25.25,8.74-37.93,11.77-35.75,8.37-68.11,12.45-98.93,12.45-37.86,0-69.49-6.59-91.47-19.05-24.29-13.77-36.6-34.28-36.6-60.96,0-12.24,2.79-26.82,8.29-43.33.49-1.48-.23-3.1-1.67-3.71l-11.65-4.95c-1.43-.61-3.09-.02-3.82,1.35-11.8,22.23-17.54,45.74-17.54,71.9,0,35.09,14.3,62.03,42.49,80.08,24.82,15.89,60.52,24.29,103.24,24.29,57.18,0,132.5-18.87,159.14-35.1.42-.25.77-.61,1.02-1.03,8.99-15.08,15.86-28.36,15.86-50.18,0-35.58-22.59-78.13-29.52-90.32Z" />
      <path d="m321.24,273.28c-1.26-.92-3.01-.72-4.03.45-8.38,9.62-16.7,20.51-23.73,29.88-.95,1.27-.75,3.06.46,4.09,2.19,1.86,4.38,3.71,6.55,5.54,9.53,8.05,18.54,15.66,27.7,24.35.58.55,1.32.82,2.06.82.69,0,1.38-.24,1.95-.72,9.71-8.28,17.81-17.85,24.79-29.26.71-1.16.55-2.65-.39-3.63-11.73-12.33-23.62-22.94-35.36-31.52Z" />
      <path d="m256.38,433.6l-90-218c-4.64-11.23-17.5-16.58-28.73-11.94-5.41,2.23-9.71,6.53-11.94,11.94l-90,218c-4.69,11.21.59,24.1,11.8,28.79,11.21,4.69,24.1-.59,28.79-11.8.03-.07.06-.14.08-.2l18.33-44.39h102.67l18.33,44.39c3.4,8.24,11.43,13.61,20.34,13.61,12.15,0,21.99-9.86,21.99-22.01,0-2.88-.57-5.73-1.67-8.39h0Zm-143.5-71.6l33.17-80.35,33.17,80.35h-66.34Z" />
    </svg>
  );
};

const ScrollLanguage = () => {
  const { state } = useContext(ScrollContext);
  const { activeLanguages, annotations } = state;

  const languages = annotations
    ? (extractLanguages(annotations) as string[])
    : [];

  return (
    <StyledScrollLanguage>
      <Popover>
        <Popover.Trigger>
          <LanguageIcon
            title="language"
            style={{ width: "18px", height: "18px" }}
          />
        </Popover.Trigger>
        <Popover.Content>
          <label>Language</label>
          {languages.map((lang) => (
            <LanguageOption
              isChecked={activeLanguages?.includes(lang)}
              key={lang}
              lang={lang}
            />
          ))}
        </Popover.Content>
      </Popover>
    </StyledScrollLanguage>
  );
};

export default ScrollLanguage;
