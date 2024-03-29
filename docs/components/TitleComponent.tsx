import React, { CSSProperties } from "react";

interface TitleComponentProps {
  title: string;
  type: string;
}

const betaBadgeStyling: CSSProperties = {
  position: "relative",
  top: "-1px",
  right: "0",

  backgroundColor:
    "hsl(var(--nextra-primary-hue), var(--nextra-primary-saturation), 32%)",
  color: "white",
  borderRadius: "6px",
  padding: "2px 4px",
  fontSize: "0.7222rem",
  fontWeight: "700",
  marginLeft: "10px",
};

const isBeta = ["Scroll"];

const TitleComponent: React.FC<TitleComponentProps> = ({ title }) => {
  if (isBeta.includes(title))
    return (
      <span>
        {title}
        <span style={betaBadgeStyling}>Beta</span>
      </span>
    );

  return <span>{title}</span>;
};

export default TitleComponent;
