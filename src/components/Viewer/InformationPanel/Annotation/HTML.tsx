import { Annotation, Body, EmbeddedResource } from "@iiif/presentation-3";

type AnnotationItemHTMLProps = {
  annotation: Annotation;
  handleClick: (e) => void;
};

const AnnotationItemHTML: React.FC<AnnotationItemHTMLProps> = ({
  annotation,
  handleClick,
}) => {
  const { body } = annotation;
  const { value = "" } = body as unknown as Body & EmbeddedResource;
  return (
    <button dangerouslySetInnerHTML={{ __html: value }} onClick={handleClick} />
  );
};

export default AnnotationItemHTML;
