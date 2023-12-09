import React from "react";
import { LabeledAnnotationedResource } from "src/hooks/use-iiif/getAnnotationResources";
import { Group } from "src/components/Viewer/InformationPanel/AnnotationItem.styled";
import AnnotationItem from "src/components/Viewer/InformationPanel/AnnotationItem";

type Props = {
  resource: LabeledAnnotationedResource;
};
export const AnnotationResource: React.FC<Props> = ({ resource }) => {
  return (
    <Group>
      {resource.items.map((item, i) => (
        <AnnotationItem key={i} item={item}></AnnotationItem>
      ))}
    </Group>
  );
};

export default AnnotationResource;
