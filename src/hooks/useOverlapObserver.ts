import { RefObject, useEffect, useState } from "react";

const useOverlapObserver = (
  targetRef: RefObject<HTMLElement>,
  rootRef: RefObject<HTMLElement>,
) => {
  const [isOverlapping, setIsOverlapping] = useState(false);

  useEffect(() => {
    const target = targetRef?.current;
    const root = rootRef?.current;

    if (!target || !root) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        setIsOverlapping(entry.isIntersecting);
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: root,
    });

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [targetRef, rootRef]);

  return isOverlapping;
};

export default useOverlapObserver;
