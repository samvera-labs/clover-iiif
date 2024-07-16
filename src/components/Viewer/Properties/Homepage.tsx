import { DataList } from "@radix-ui/themes";
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
    <DataList.Root orientation="vertical">
      <DataList.Item role="group">
        <DataList.Label>Homepage</DataList.Label>
        <DataList.Value>
          <Homepage homepage={homepage} />
        </DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
};

export default PropertiesHomepage;
