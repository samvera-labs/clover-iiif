import React from "react";

interface ErrorFallbackProps {
  error: Error;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
  const { message } = error;

  return (
    <div className="clover-error-fallback" role="alert">
      <p className="clover-error-fallback-headline" data-testid="headline">
        Something went wrong
      </p>
      {message && (
        <span className="clover-error-fallback-body">
          {`Error message: ${message}`}{" "}
        </span>
      )}
    </div>
  );
};

export default ErrorFallback;
