import { Annotation, Body, EmbeddedResource } from "@iiif/presentation-3";

type AnnotationItemPlainTextProps = {
  annotation: Annotation;
  handleClick: (e) => void;
};

const AnnotationItemPlainText: React.FC<AnnotationItemPlainTextProps> = ({
  annotation,
  handleClick,
}) => {
  const { body } = annotation;
  const { value } = body as unknown as Body & EmbeddedResource;

  return <button onClick={handleClick}>{value}</button>;
};

export default AnnotationItemPlainText;
