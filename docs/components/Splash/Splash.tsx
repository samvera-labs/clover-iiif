import { ReactNode } from "react";
import { styled } from "src/styles/stitches.config";

const Splash = ({ children }: { children: ReactNode | ReactNode[] }) => {
  return (
    <StyledSplashWrapper className="nx-bg-gray-100 nx-pb-[env(safe-area-inset-bottom)] dark:nx-bg-neutral-900 print:nx-bg-transparent">
      <StyledSplash>{children}</StyledSplash>
    </StyledSplashWrapper>
  );
};

export const StyledGrid = styled("div", {
  display: "flex",
  gap: "2rem",

  "@md": {
    flexDirection: "column",
    gap: "0",
  },

  "> div": {
    flexShrink: "0",
    flexGrow: "1",
  },

  aside: {
    flexShrink: "1",
    flexGrow: "0",
    width: "38.2%",

    "@md": {
      flexShrink: "0",
      flexGrow: "1",
      width: "100%",
    },
  },
});

export const StyledSplashWrapper = styled("div", {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
});

export const StyledSplash = styled("div", {
  maxWidth: "90rem",
  width: "100%",
  padding: "1rem",
  flexShrink: "0",
  flexGrow: "0",

  "@lg": {
    padding: "1rem 4rem",
  },

  "@md": {
    padding: "0 3rem 3rem",
  },

  "@sm": {
    padding: "0 1rem 3rem",
  },
});

export default Splash;
