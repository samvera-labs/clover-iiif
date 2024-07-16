import { DataList, Link } from "@radix-ui/themes";

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
    <DataList.Root orientation="vertical">
      <DataList.Item role="group">
        <DataList.Label>{htmlLabel}</DataList.Label>
        <DataList.Value>
          <Link href={id} target="_blank" id={`iiif-${parent}-id`}>
            {id}
          </Link>
        </DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
};

export default PropertiesId;
