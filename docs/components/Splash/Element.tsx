import React, { ReactElement } from "react";

import { CSS } from "@stitches/react/types/css-util";
import CallToAction from "../CallToAction";
import { styled } from "src/styles/stitches.config";
import { useRouter } from "next/router";

interface SplashElemenProps {
  component?: ReactElement;
  children?: React.ReactNode;
  css?: CSS;
  href: string;
  text: string;
}

const SplashElement: React.FC<SplashElemenProps> = ({
  component,
  children,
  css,
  href = "/",
  text,
}) => {
  const router = useRouter();
  const handleClick = () => router.push(href);

  return (
    <StyledSplashElement
      css={css}
      onClick={handleClick}
      className="nx-bg-white dark:nx-bg-neutral-900"
    >
      <Inner>
        <Title>{text}</Title>
        <HighlightCode>{children}</HighlightCode>
      </Inner>
      <Preview>{component}</Preview>
    </StyledSplashElement>
  );
};

const gradientMask = ["rgba(0, 0, 0, 0.2) 0", "rgba(0, 0, 0, 1) 5rem"];

const Preview = styled("div", {
  lineHeight: "1",
  position: "absolute",
  width: "100%",
  height: "100%",
  zIndex: "0",
  transition: "all 200ms ease-in-out",
  margin: "6rem 0 0",
  padding: "1.5rem ",
  background: "hsla(var(--nextra-primary-hue), 100%, 100%, 1%)",
  maskImage: `linear-gradient(0deg, ${gradientMask.join(", ")})`,

  "p, span, dl": {
    lineHeight: "1.35",

    dt: {
      fontWeight: "700",
      fontSize: "0.75em",
      textTransform: "uppercase",
      marginBottom: "0.25em",
    },

    dd: {
      display: "block",

      "&:last-of-type": {
        marginBottom: "1rem",
      },
    },
  },

  ".clover-link": {
    textDecoration: "underline",
    color: "hsl(var(--nextra-primary-hue) 100% 45%)",
  },
});

const HighlightCode = styled("span", {
  display: "flex",
  flexWrap: "wrap",
  flexShrink: "1",
  width: "100%",
  fontWeight: "300",
  lineHeight: "1",
  padding: "0 !important",
  margin: "-2rem 1.5rem 1rem !important",
  opacity: "1",
  transition: "all 100ms ease-in-out",
  position: "absolute",

  "pre, code": {
    span: {
      padding: "0 !important",
    },
  },
});

const Title = styled("span", {
  lineHeight: "1",
  fontSize: "1.25rem",
  fontWeight: "800",
  letterSpacing: "-0.02em",
  display: "flex",
  alignItems: "center",
  alignSelf: "flex-start",
  padding: "1.5rem 1.5rem 3rem",
  width: "100%",
  transition: "all 100ms ease-in-out",

  "&::after": {
    fontWeight: "500",
    fontSize: "1rem",
    display: "inline-flex",
    content: "→",
    opacity: "0",
    transition: "all 100ms ease-in-out",
    marginLeft: "-0.5rem",
  },
});

const Inner = styled("div", {
  fontWeight: "700",
  borderRadius: "3px",
  transition: "all 200ms ease-in-out",
  boxShadow: "1px 1px 5px #0001",
  position: "relative",
  width: "100%",
});

const StyledSplashElement = styled("button", {
  display: "flex",
  flexDirection: "column",
  textAlign: "left",
  width: "100%",
  margin: "0 0 2rem",
  borderRadius: "6px",
  position: "relative",
  zIndex: "0",
  overflow: "hidden",
  transition: "all 200ms ease-in-out",
  boxShadow: "2px 5px 14.6px #0001",
  minHeight: "165px",
  cursor: "pointer",

  "&::after": {
    content: "",
    display: "flex",
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "transparent",
  },

  "@md": {
    marginBottom: "1rem",
  },

  "&:hover, &:focus": {
    opacity: "1",
    boxShadow:
      "-15px 0 30px -15px hsla(var(--nextra-primary-hue), 100%, 45%, 20%), 0 0 30px -15px hsla(235, 100%, 38.2%, 38.2%), 15px 0 30px -15px hsla(calc(var(--nextra-primary-hue) + 10deg), 100%, 85%, 25%)",

    [`${Title}`]: {
      color: "transparent",
      background:
        "linear-gradient(130deg, hsl(var(--nextra-primary-hue), 100%, 45%) 0%, hsl(calc(var(--nextra-primary-hue) + 50deg), 100%, 38.2%) 100%)",
      paddingBottom: "1.5rem",
      backgroundClip: "text",

      "&::after": {
        opacity: "1",
        marginLeft: "0.5rem",
        color: "hsla(var(--nextra-primary-hue), 100%, 75%, 61.8%)",
      },
    },

    [`${Inner}`]: {
      backgroundColor: "",

      [`${HighlightCode}`]: {
        opacity: "0",
      },
    },

    [`${Preview}`]: {
      opacity: "1",
      marginTop: "4rem",
    },
  },
});

export default SplashElement;
