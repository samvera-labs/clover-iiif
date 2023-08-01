import React from "react";
import {
  ErrorFallbackStyled,
  ErrorBody,
  Headline,
} from "./ErrorFallback.styled";

interface ErrorFallbackProps {
  error: Error;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
  const { message } = error;

  return (
    <ErrorFallbackStyled role="alert">
      <Headline data-testid="headline">Something went wrong</Headline>
      {message && <ErrorBody>{`Error message: ${message}`} </ErrorBody>}
    </ErrorFallbackStyled>
  );
};

export default ErrorFallback;
