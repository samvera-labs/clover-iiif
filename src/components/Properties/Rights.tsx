import React from "react";

interface PropertiesRightsProps {
  rights: string | null;
  parent?: "manifest" | "canvas";
}

const PropertiesRights: React.FC<PropertiesRightsProps> = ({
  rights,
  parent = "manifest",
}) => {
  if (!rights) return <></>;

  return (
    <>
      <label
        className="manifest-property-title"
        htmlFor={`iiif-${parent}-rights`}
      >
        Rights
      </label>
      <span>
        <a href={rights} target="_blank" id={`iiif-${parent}-rights`}>
          {rights}
        </a>
      </span>
    </>
  );
};

export default PropertiesRights;
