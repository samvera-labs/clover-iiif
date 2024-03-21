import {
  ErrorBody,
  ErrorFallbackStyled,
  Headline,
} from "src/components/UI/ErrorFallback/ErrorFallback.styled";

import React from "react";

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
