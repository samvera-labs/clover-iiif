type AnnotationItemPlainTextProps = {
  value: string;
  handleClick: (e) => void;
};

const AnnotationItemPlainText: React.FC<AnnotationItemPlainTextProps> = ({
  value,
  handleClick,
}) => {
  return <button onClick={handleClick}>{value}</button>;
};

export default AnnotationItemPlainText;
