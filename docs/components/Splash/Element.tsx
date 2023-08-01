import { CSS } from "@stitches/react/types/css-util";
import { useRouter } from "next/router";
import React, { ReactElement } from "react";
import { styled } from "src/styles/stitches.config";

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

const Preview = styled("div", {
  lineHeight: "1",
  position: "absolute",
  width: "100%",
  height: "100%",
  zIndex: "0",
  transition: "all 200ms ease-in-out",
  margin: "6rem 0 0",
  padding: "1.5rem ",
  background: "hsla(var(--nextra-primary-hue), 100%, 100%, 5%)",

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
  fontWeight: "400",
  letterSpacing: "-0.015em",
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
  boxShadow: "0 2px 5px #0001",
  position: "relative",
});

const gradientMask = ["rgba(0, 0, 0, 0.2) 0", "rgba(0, 0, 0, 1) 5rem"];

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
  maskImage: `linear-gradient(0deg, ${gradientMask.join(", ")})`,

  "&::after": {
    content: "",
    display: "flex",
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "transparent",
  },

  cursor: "pointer",

  "&:hover, &:focus": {
    opacity: "1",
    boxShadow: "3px 9px 24.6px #0002",
    outline: "2px solid hsl(var(--nextra-primary-hue) 100% 45%)",

    [`${Title}`]: {
      color: "#fff",
      background: "hsl(var(--nextra-primary-hue), 100%, 45%) !important",
      paddingBottom: "1.5rem",

      "&::after": {
        opacity: "0.5",
        marginLeft: "0.5rem",
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
