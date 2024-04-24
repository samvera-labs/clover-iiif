import {
  Add,
  Audio,
  Close,
  Download,
  Image,
  Video,
} from "src/components/UI/Icons";
import { type CSS, type VariantProps } from "src/styles/stitches.config";

import React from "react";
import { StyledIcon } from "./Icon.styled";

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

type VariantComponentProps = React.SVGAttributes<SVGElement>;
type IconVariants = VariantProps<typeof StyledIcon>;
type IconProps = VariantComponentProps &
  IconVariants & { css?: CSS } & IconShape;

const Icon: React.FC<IconProps> & IconComposition = (props) => {
  return (
    <StyledIcon
      {...props}
      data-testid="icon-svg"
      role="img"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      {props.children}
    </StyledIcon>
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
