import { ReactNode } from "react";
import { styled } from "src/styles/stitches.config";

const Splash = ({ children }: { children: ReactNode | ReactNode[] }) => {
  return (
    <StyledSplashWrapper>
      <StyledSplash>{children}</StyledSplash>
    </StyledSplashWrapper>
  );
};

export const StyledGrid = styled("div", {
  display: "flex",
  gap: "2rem",

  "> div": {
    flexShrink: "0",
    flexGrow: "1",
  },

  aside: {
    flexShrink: "1",
    flexGrow: "0",
    width: "38.2%",
  },
});

export const StyledSplashWrapper = styled("div", {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  background: "linear-gradient(0deg, #0001 61.8%, transparent)",
});

export const StyledSplash = styled("div", {
  maxWidth: "90rem",
  width: "100%",
  padding: "1rem",
  flexShrink: "0",
  flexGrow: "0",
});

export default Splash;
