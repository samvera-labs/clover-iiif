import { Homepage } from "src/components/Primitives";
import { PrimitivesExternalWebResource } from "src/types/primitives";
import React from "react";

interface PropertiesHomepageProps {
  homepage: PrimitivesExternalWebResource[];
}

const PropertiesHomepage: React.FC<PropertiesHomepageProps> = ({
  homepage,
}) => {
  if (homepage?.length === 0) return <></>;

  return (
    <>
      <span className="manifest-property-title">Homepage</span>
      <Homepage homepage={homepage} />
    </>
  );
};

export default PropertiesHomepage;
