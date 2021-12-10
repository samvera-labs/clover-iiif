import { useEffect, useLayoutEffect, useState } from "react";

type ReturnType = [boolean, (locked: boolean) => void];

export const useBodyLocked = (initialLocked = false): ReturnType => {
  const [locked, setLocked] = useState(initialLocked);

  useLayoutEffect(() => {
    if (!locked) {
      return;
    }

    const originalOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = originalOverflow;
    };
  }, [locked]);

  useEffect(() => {
    if (locked !== initialLocked) {
      setLocked(initialLocked);
    }
  }, [initialLocked]);

  return [locked, setLocked];
};
