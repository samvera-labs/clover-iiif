import {
  Add,
  Audio,
  Close,
  Download,
  Image,
  Video,
} from "src/components/UI/Icons";

import React from "react";
import {
  iconBase,
  iconSizeLarge,
  iconSizeMedium,
  iconSizeSmall,
} from "./Icon.css";

/**
 * Define SVG sub element <title>
 */
type TitleShape = {
  children: React.ReactNode;
};

const Title: React.FC<TitleShape> = ({ children }) => {
  return <title>{children}</title>;
};

/**
 * Define <svg>
 */

type IconShape = {
  children: React.ReactNode | React.ReactNode[];
};
interface IconComposition {
  Add: React.FC;
  Audio: React.FC;
  Close: React.FC;
  Download: React.FC;
  Image: React.FC;
  Title: React.FC<TitleShape>;
  Video: React.FC;
}

type IconProps = React.SVGAttributes<SVGSVGElement> &
  IconShape & {
    isLarge?: boolean;
    isMedium?: boolean;
    isSmall?: boolean;
  };

const Icon: React.FC<IconProps> & IconComposition = ({
  children,
  className,
  isLarge,
  isMedium,
  isSmall,
  ...rest
}) => {
  const sizeClass = isLarge
    ? iconSizeLarge
    : isMedium
      ? iconSizeMedium
      : isSmall
        ? iconSizeSmall
        : undefined;
  const classes = [iconBase, sizeClass, className].filter(Boolean).join(" ");

  return (
    <svg
      {...rest}
      className={classes}
      data-testid="icon-svg"
      role="img"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
};

/**
 * Title
 */
Icon.Title = Title;

/**
 * Path
 */
Icon.Add = Add;
Icon.Audio = Audio;
Icon.Close = Close;
Icon.Download = Download;
Icon.Image = Image;
Icon.Video = Video;

export { Icon };
