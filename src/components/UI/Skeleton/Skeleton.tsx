import React from "react";
import { SkeletonStyled } from "./Skeleton.styled";

const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  ...props
}) => {
  return <SkeletonStyled {...props} />;
};

export default Skeleton;
