import React from "react";
import { tag } from "./Tag.css";

export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  isIcon?: boolean;
}

export const Tag: React.FC<TagProps> = ({ isIcon, className, ...rest }) => {
  const classes = [tag, className].filter(Boolean).join(" ");

  return (
    <div
      {...rest}
      className={classes}
      data-has-icon={isIcon ? "true" : undefined}
      data-ui-tag="true"
    />
  );
};
