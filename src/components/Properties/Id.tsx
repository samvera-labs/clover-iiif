import React from "react";

interface PropertiesIdProps {
  id: string;
  htmlLabel: string;
  parent?: "manifest" | "canvas";
}

const PropertiesId: React.FC<PropertiesIdProps> = ({
  id,
  htmlLabel,
  parent = "manifest",
}) => {
  return (
    <>
      <span className="manifest-property-title">{htmlLabel}</span>
      <a href={id} target="_blank" id={`iiif-${parent}-id`}>
        {id}
      </a>
    </>
  );
};

export default PropertiesId;
