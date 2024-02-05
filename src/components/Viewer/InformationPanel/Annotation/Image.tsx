import { ButtonStyled } from "./Item.styled";
import React from "react";

type AnnotationItemImageProps = {
  caption: string;
  handleClick: (e) => void;
  imageUri: string;
};

const AnnotationItemImage: React.FC<AnnotationItemImageProps> = ({
  caption,
  handleClick,
  imageUri,
}) => {
  return (
    <ButtonStyled onClick={handleClick}>
      <img src={imageUri} alt={`A visual annotation for ${caption}`} />
      <span>{caption}</span>
    </ButtonStyled>
  );
};

export default AnnotationItemImage;
