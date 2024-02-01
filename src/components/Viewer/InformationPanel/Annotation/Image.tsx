type AnnotationItemImageProps = {
  caption: string;
  handleClick: (e) => void;
  imageUri: string;
};

const AnnotationItemImage: React.FC<AnnotationItemImageProps> = ({
  caption,
  handleClick,
  imageUri,
}) => {
  return (
    <button onClick={handleClick}>
      <img src={imageUri} alt={`A visual annotation for ${caption}`} />
      <span>{caption}</span>
    </button>
  );
};

export default AnnotationItemImage;
