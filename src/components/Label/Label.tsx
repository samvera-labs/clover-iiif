import React, { useEffect, useState } from "react";

interface Props {
  label: object;
  language: string;
}

export const Label: React.FC<Props> = ({ label, language }) => {
  return <span>{label[language][0]}</span>;
};
