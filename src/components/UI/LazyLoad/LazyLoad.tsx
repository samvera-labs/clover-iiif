import React, { useEffect, useRef, useState } from "react";

interface LazyLoadProps {
  children: React.ReactNode;
  rootMargin?: string;
}

const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  rootMargin = "100px",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return <div ref={ref}>{isVisible ? children : null}</div>;
};

export default LazyLoad;
