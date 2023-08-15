import { PrimitivesExternalWebResource } from "src/types/primitives";
import { SeeAlso } from "src/components/Primitives";
import React from "react";

interface PropertiesSeeAlsoProps {
  seeAlso: PrimitivesExternalWebResource[];
}

const PropertiesSeeAlso: React.FC<PropertiesSeeAlsoProps> = ({ seeAlso }) => {
  if (seeAlso?.length === 0) return <></>;

  return (
    <>
      <span className="manifest-property-title">See Also</span>
      <SeeAlso seeAlso={seeAlso} />
    </>
  );
};

export default PropertiesSeeAlso;
