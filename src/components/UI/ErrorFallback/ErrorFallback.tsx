import React from "react";
import {
  errorBody,
  errorFallback,
  errorHeadline,
} from "src/components/UI/ErrorFallback/ErrorFallback.css";

interface ErrorFallbackProps {
  error: Error;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
  const { message } = error;

  return (
    <div className={errorFallback} role="alert">
      <p className={errorHeadline} data-testid="headline">
        Something went wrong
      </p>
      {message && <span className={errorBody}>{`Error message: ${message}`} </span>}
    </div>
  );
};

export default ErrorFallback;
