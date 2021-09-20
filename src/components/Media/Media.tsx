import React, { useEffect, useState } from "react";

interface Props {
  items: object;
  activeItem: number;
}

export const Media: React.FC<Props> = ({ items, activeItem }) => {
  return <>{activeItem}</>;
};
