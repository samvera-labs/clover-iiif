import React from "react";

interface ErrorFallbackProps {
  error: Error;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
  const { message } = error;

  return (
    <div className="clover-slider-error" role="alert">
      <p className="clover-slider-error-headline" data-testid="headline">
        Something went wrong
      </p>
      {message && <span>{`Error message: ${message}`} </span>}
    </div>
  );
};

export default ErrorFallback;
