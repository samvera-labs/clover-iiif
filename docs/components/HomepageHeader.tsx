import React from "react";
import { styled } from "src/styles/stitches.config";
import CallToAction from "docs/components/CallToAction";

const HomepageHeader: React.FC = () => {
  return (
    <StyledHomepageHeader>
      <Headline>
        Showcase IIIF Manifests <br />
        as interopable web content.
      </Headline>
      <Subtitle>
        Extensible IIIF front-end toolkit and Manifest viewer. Accessible.
        Composable. Open Source.
      </Subtitle>
      <CallToAction href="/docs" text="Get started" />
    </StyledHomepageHeader>
  );
};

const Headline = styled("h1", {
  display: "inline-flex",
  fontSize: "3.8rem",
  fontWeight: "800",
  letterSpacing: "-0.12rem",
  lineHeight: "1",
  padding: "1em 0 0.5em 0",
});

const Subtitle = styled("p", {
  fontSize: "1.3rem",
  lineHeight: "1.6",
  opacity: "0.8",
  marginBottom: "2rem",
});

const StyledHomepageHeader = styled("div", {
  maxWidth: "90rem",
  margin: "0 auto",
  padding: "0 1rem 3rem",
});

export default HomepageHeader;
