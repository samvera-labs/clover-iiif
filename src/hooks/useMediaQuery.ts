import { useEffect, useState } from "react";

export const useMediaQuery = (mediaQuery: string) => {
  const match = () => {
    if (!window.matchMedia) {
      return false;
    }
    return window.matchMedia(mediaQuery).matches;
  };

  const [isMatch, setIsMatch] = useState<boolean>(match);

  useEffect(() => {
    const handler = () => setIsMatch(match);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  });

  return isMatch;
};
