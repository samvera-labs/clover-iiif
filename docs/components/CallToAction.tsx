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
  backgroundColor: "hsl(var(--nextra-primary-hue) 100% 45%)",
  padding: "0.75rem 1.5rem",
  gap: "0.5rem",

  span: {
    display: "inline-flex",
    opacity: "0.5",
  },
});

export default CallToAction;
