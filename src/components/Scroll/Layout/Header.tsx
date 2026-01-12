import React, { useContext, useEffect, useRef, useState } from "react";

import { InternationalString } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import { ScrollContext, initialState } from "src/context/scroll-context";
import ScrollPanel from "../Panel/Panel";
import { StyledScrollHeader } from "src/components/Scroll/Layout/Layout.styled";

interface ScrollHeaderProps {
  label: InternationalString | string | null;
  hasDefinedLanguages: boolean;
}

const ScrollHeader: React.FC<ScrollHeaderProps> = ({
  label,
  hasDefinedLanguages,
}) => {
  const { state } = useContext(ScrollContext);
  const { options } = state;
  const scrollOffset =
    options.offset ?? initialState.options.offset ?? 0;

  const headerRef = useRef<HTMLElement | null>(null);
  const [headerWidth, setHeaderWidth] = useState<number>(0);
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const element = headerRef.current;

    if (!element) return;

    // Initialize ResizeObserver to monitor width changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setHeaderWidth(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(element);

    // Cleanup observer on component unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const element = headerRef.current;

      if (!element) return;

      const rect = element.getBoundingClientRect();

      // Determine if the header is at the top of the viewport
      if (rect.top <= scrollOffset) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <StyledScrollHeader ref={headerRef}>
      <Label
        label={label as InternationalString}
        className="clover-scroll-header-label"
      />
      <div>
        <ScrollPanel
          width={headerWidth}
          isFixed={isFixed}
          hasDefinedLanguages={hasDefinedLanguages}
        />
      </div>
    </StyledScrollHeader>
  );
};

export default ScrollHeader;
