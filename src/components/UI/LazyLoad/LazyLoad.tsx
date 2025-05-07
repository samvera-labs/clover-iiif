import React, { useEffect, useRef, useState } from "react";

interface LazyLoadProps {
  children: React.ReactNode;
  rootMargin?: string;
  attributes?: Record<string, string>;
  isVisibleCallback?: (isVisible: boolean) => void;
}

const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  rootMargin = "100px",
  attributes = {},
  isVisibleCallback = () => {},
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisibleCallback(true);
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return (
    <div ref={ref} {...attributes}>
      {isVisible ? children : null}
    </div>
  );
};

export default LazyLoad;
