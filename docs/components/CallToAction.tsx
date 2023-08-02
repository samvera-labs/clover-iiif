import Link from "next/link";
import React from "react";
import { styled } from "src/styles/stitches.config";

interface CallToActionProps {
  href: string;
  text: string;
}

const CallToAction: React.FC<CallToActionProps> = ({ href, text }) => {
  return (
    <StyledCallToAction href={href} className="nx-bg-primary-400/10">
      {text} <span>→</span>
    </StyledCallToAction>
  );
};

const StyledCallToAction = styled(Link, {
  display: "inline-flex",
  fontSize: "1.3rem",
  lineHeight: "1.6",
  borderRadius: "6px",
  color: "#fff",
  background:
    "linear-gradient(130deg, hsl(var(--nextra-primary-hue), 100%, 45%) 0%, hsl(calc(var(--nextra-primary-hue) + 50deg), 100%, 38.2%) 100%)",
  padding: "0.75rem 1.5rem",
  gap: "0.5rem",
  boxShadow:
    "-15px 0 30px -15px hsl(var(--nextra-primary-hue) 100% 45%), 0 0 30px -15px hsl(235 100% 38.2%), 15px 0 30px -15px hsl(calc(var(--nextra-primary-hue) + 50deg), 100%, 45%)",
  textShadow: "-1px -1px 2px hsl(var(--nextra-primary-hue), 100%, 10%, 10%)",
  transition: "all 200ms ease-in-out",

  "&:hover, &:focus": {
    boxShadow:
      "-15px 0 30px -15px hsla(var(--nextra-primary-hue), 100%, 45%, 100%), 0 0 30px -15px hsla(235, 100%, 38.2%, 38.2%), 15px 0 30px -15px hsla(calc(var(--nextra-primary-hue) + 10deg), 100%, 85%, 25%)",
  },

  span: {
    display: "inline-flex",
    color: "hsla(var(--nextra-primary-hue), 100%, 75%, 61.8%)",
  },
});

export default CallToAction;
