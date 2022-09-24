import { NectarExternalWebResource } from "@samvera/nectar-iiif/dist/types/nectar";
import { SeeAlso } from "@samvera/nectar-iiif";
import React from "react";

interface AboutSeeAlsoProps {
  seeAlso: NectarExternalWebResource[];
}

const AboutSeeAlso: React.FC<AboutSeeAlsoProps> = ({ seeAlso }) => {
  if (seeAlso?.length === 0) return <></>;

  return (
    <>
      <label
        className="manifest-property-title"
        htmlFor="iiif-manifest-see-also"
      >
        See Also
      </label>
      <SeeAlso
        seeAlso={seeAlso as unknown as NectarExternalWebResource[]}
        id="iiif-manifest-see-also"
      />
    </>
  );
};

export default AboutSeeAlso;
