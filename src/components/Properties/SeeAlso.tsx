import { NectarExternalWebResource } from "@samvera/nectar-iiif/dist/types/nectar";
import { SeeAlso } from "@samvera/nectar-iiif";
import React from "react";

interface PropertiesSeeAlsoProps {
  seeAlso: NectarExternalWebResource[];
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
