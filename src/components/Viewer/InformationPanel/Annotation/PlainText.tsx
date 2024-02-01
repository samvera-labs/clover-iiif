import { ButtonStyled } from "./Item.styled";

type AnnotationItemPlainTextProps = {
  value: string;
  handleClick: (e) => void;
};

const AnnotationItemPlainText: React.FC<AnnotationItemPlainTextProps> = ({
  value,
  handleClick,
}) => {
  return <ButtonStyled onClick={handleClick}>{value}</ButtonStyled>;
};

export default AnnotationItemPlainText;
