import Link from "next/link";
import React from "react";
import styles from "./CallToAction.module.css";

type CallToActionSize = "small" | undefined;

interface CallToActionProps {
  href: string;
  text: string;
  id?: HTMLElement["id"];
  target?: HTMLAnchorElement["target"];
}

const CallToAction: React.FC<CallToActionProps & { size?: CallToActionSize }>
  = ({ href, size, text, id, target }) => {
  const className = [
    styles.callToAction,
    size === "small" ? styles.small : "",
    "nx-bg-primary-400/10",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      className={className}
      href={href}
      id={id}
      target={target}
    >
      {text} <span>→</span>
    </Link>
  );
};

export default CallToAction;
