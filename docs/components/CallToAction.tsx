import { Link, LinkProps } from "@radix-ui/themes";
import { VariantProps, styled } from "src/styles/stitches.config";

import React from "react";

interface CallToActionProps extends LinkProps {
  href: string;
  text: string;
}

const CallToAction: React.FC<CallToActionProps> = ({
  href,
  size = "3",
  text,
}) => {
  return (
    <StyledCallToAction
      className="rt-BaseButton rt-Button rt-r-size-2 rt-variant-solid"
      href={href}
      size={size}
      underline="none"
    >
      {text} <span>→</span>
    </StyledCallToAction>
  );
};

const StyledCallToAction = styled(Link, {
  span: {
    display: "inline-flex",
  },
});

export default CallToAction;
