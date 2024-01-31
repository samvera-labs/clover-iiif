type AnnotationItemHTMLProps = {
  value: string;
  handleClick: (e) => void;
};

const AnnotationItemHTML: React.FC<AnnotationItemHTMLProps> = ({
  value,
  handleClick,
}) => {
  return (
    <button dangerouslySetInnerHTML={{ __html: value }} onClick={handleClick} />
  );
};

export default AnnotationItemHTML;
