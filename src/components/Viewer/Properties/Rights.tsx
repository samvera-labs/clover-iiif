import React from "react";

interface PropertiesRightsProps {
  rights: string | null;
}

const PropertiesRights: React.FC<PropertiesRightsProps> = ({ rights }) => {
  if (!rights) return <></>;

  return (
    <>
      <span className="manifest-property-title">Rights</span>
      <a href={rights} target="_blank">
        {rights}
      </a>
    </>
  );
};

export default PropertiesRights;
