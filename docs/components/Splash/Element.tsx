import React, { ReactElement } from "react";
import { useRouter } from "next/router";
import styles from "./Element.module.css";

interface SplashElemenProps {
  component?: ReactElement;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  href: string;
  text: string;
}

const SplashElement: React.FC<SplashElemenProps> = ({
  component,
  children,
  style,
  href = "/",
  text,
}) => {
  const router = useRouter();
  const handleClick = () => router.push(href);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={`${styles.element} nx-bg-white dark:nx-bg-neutral-900`}
    >
      <div className={styles.inner}>
        <span className={styles.title}>{text}</span>
        <span className={styles.highlight}>{children}</span>
      </div>
      <div className={styles.preview}>{component}</div>
    </div>
  );
};
export default SplashElement;
