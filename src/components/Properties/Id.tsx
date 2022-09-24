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
      <label className="manifest-property-title" htmlFor={`iiif-${parent}-id`}>
        {htmlLabel}
      </label>
      <span>
        <a href={id} target="_blank" id={`iiif-${parent}-id`}>
          {id}
        </a>
      </span>
    </>
  );
};

export default PropertiesId;
