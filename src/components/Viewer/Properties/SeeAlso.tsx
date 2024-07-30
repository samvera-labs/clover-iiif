import { DataList, Link } from "@radix-ui/themes";

import { PrimitivesExternalWebResource } from "src/types/primitives";
import React from "react";
import { SeeAlso } from "src/components/Primitives";

interface PropertiesSeeAlsoProps {
  seeAlso: PrimitivesExternalWebResource[];
}

const PropertiesSeeAlso: React.FC<PropertiesSeeAlsoProps> = ({ seeAlso }) => {
  if (seeAlso?.length === 0) return <></>;

  return (
    <DataList.Root orientation="vertical" size="3">
      <DataList.Item role="group">
        <DataList.Label>See Also</DataList.Label>
        <DataList.Value>
          <SeeAlso seeAlso={seeAlso} as={Link} />
        </DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
};

export default PropertiesSeeAlso;
