import { ReactNode } from "react";
import styles from "./Splash.module.css";

type WrapperProps = {
  children: ReactNode | ReactNode[];
  className?: string;
};

const Splash = ({ children }: WrapperProps) => {
  return (
    <StyledSplashWrapper className="nx-bg-gray-100 nx-pb-[env(safe-area-inset-bottom)] dark:nx-bg-neutral-900 print:nx-bg-transparent">
      <StyledSplash>{children}</StyledSplash>
    </StyledSplashWrapper>
  );
};

export const StyledGrid = ({ children }: WrapperProps) => (
  <div className={styles.grid}>{children}</div>
);

export const StyledSplashWrapper = ({
  children,
  className,
}: WrapperProps) => (
  <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
    {children}
  </div>
);

export const StyledSplash = ({ children, className }: WrapperProps) => (
  <div className={[styles.splash, className].filter(Boolean).join(" ")}>
    {children}
  </div>
);

export default Splash;
