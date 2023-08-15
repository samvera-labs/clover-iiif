import CallToAction from "docs/components/CallToAction";
import React from "react";
import { styled } from "src/styles/stitches.config";

const HomepageHeader: React.FC = () => {
  return (
    <Wrapper>
      <StyledHomepageHeader>
        <Headline>
          Showcase IIIF Manifests <br />
          as interopable web content.
        </Headline>
        <Subtitle>
          Extensible IIIF front-end toolkit and Manifest viewer. Accessible.
          Composable. Open Source.
        </Subtitle>
        <CallToAction href="/docs" text="Get Started" />
      </StyledHomepageHeader>
      <Gradient className="nx-bg-gray-100 nx-pb-[env(safe-area-inset-bottom)] dark:nx-bg-neutral-900 print:nx-bg-transparent" />
    </Wrapper>
  );
};

const Headline = styled("h1", {
  display: "inline-flex",
  fontSize: "3.8rem",
  fontWeight: "800",
  letterSpacing: "-0.12rem",
  lineHeight: "1",
  padding: "3rem 0 1rem 0",

  "@md": {
    fontSize: "3rem",
  },
});

const Subtitle = styled("p", {
  fontSize: "1.47rem",
  lineHeight: "1.6",
  opacity: "0.7",
  marginBottom: "2rem",
});

const Wrapper = styled("div", {
  position: "relative",
  zIndex: "0",
});

const Gradient = styled("div", {
  top: "0",
  height: "100%",
  width: "100%",
  position: "absolute",
  zIndex: "0",
  maskImage: `linear-gradient(180deg, transparent 61.8%, rgba(0, 0, 0, 1) 100%)`,
});

const StyledHomepageHeader = styled("div", {
  position: "relative ",
  maxWidth: "90rem",
  margin: "0 auto",
  padding: "0 1rem 3rem",
  zIndex: "1",

  "@lg": {
    padding: "0 4rem 3rem",
  },

  "@md": {
    padding: "0 3rem 3rem",
  },

  "@sm": {
    padding: "0 1rem 3rem",
  },
});

export default HomepageHeader;
