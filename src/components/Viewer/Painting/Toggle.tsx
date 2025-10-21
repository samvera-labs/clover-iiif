import React from "react";
import { ToggleStyled } from "./Painting.styled";
import { useTranslation } from "react-i18next";

interface ToggleProps {
  handleToggle: () => void;
  isInteractive: boolean;
  isMedia: boolean;
}

const CloseIcon = ({ label }: { label: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="close-svg-title"
      focusable="false"
      viewBox="0 0 512 512"
      role="img"
    >
      <title id="close-svg-title">{label}</title>
      <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z" />
    </svg>
  );
};

const OpenIcon = ({ isMedia, label }: { isMedia: boolean; label: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="open-svg-title"
      focusable="false"
      viewBox="0 0 512 512"
      role="img"
    >
      <title id="open-svg-title">{label}</title>

      {isMedia ? (
        <path d="M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61l-247.89 148.4A35.5 35.5 0 01133 440z" />
      ) : (
        <>
          <path d="m456.69,421.39l-94.09-94.09c22.65-30.16,34.88-66.86,34.84-104.58,0-96.34-78.38-174.72-174.72-174.72S48,126.38,48,222.72s78.38,174.72,174.72,174.72c37.72.04,74.42-12.19,104.58-34.84l94.09,94.09c10.29,9.2,26.1,8.32,35.3-1.98,8.48-9.49,8.48-23.83,0-33.32Zm-233.97-73.87c-68.89-.08-124.72-55.91-124.8-124.8h0c0-68.93,55.87-124.8,124.8-124.8s124.8,55.87,124.8,124.8-55.87,124.8-124.8,124.8Z" />
          <path d="m279.5,197.76h-3.35s-28.47,0-28.47,0v-31.82c-.77-13.79-12.57-24.33-26.36-23.56-12.71.71-22.85,10.86-23.56,23.56v3.35h0v28.47h-31.82c-13.79.77-24.33,12.57-23.56,26.36.71,12.71,10.86,22.85,23.56,23.56h3.35s28.47,0,28.47,0v31.82c.77,13.79,12.57,24.33,26.36,23.56,12.71-.71,22.85-10.86,23.56-23.56v-3.35h0v-28.47h31.82c13.79-.77,24.33-12.57,23.56-26.36-.71-12.71-10.86-22.85-23.56-23.56Z" />
        </>
      )}
    </svg>
  );
};

const Toggle: React.FC<ToggleProps> = ({
  handleToggle,
  isInteractive,
  isMedia,
}) => {
  const { t } = useTranslation();

  return (
    <ToggleStyled
      onClick={handleToggle}
      isInteractive={isInteractive}
      isMedia={isMedia}
      data-testid="placeholder-toggle"
    >
      {isInteractive ? (
        <CloseIcon label={t("commonClose")} />
      ) : (
        <OpenIcon isMedia={isMedia} label={t("commonOpen")} />
      )}
    </ToggleStyled>
  );
};

export default Toggle;
