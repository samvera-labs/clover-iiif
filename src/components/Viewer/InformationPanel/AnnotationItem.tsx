import React from "react";
import { Item } from "src/components/Viewer/InformationPanel/AnnotationItem.styled";

type Props = {
  item: any;
};

export const AnnotationItem: React.FC<Props> = ({ item }) => {
  function handleClick(e) {
    console.log(e.target.dataset);
  }

  function renderItemBody(body, target, i = 0) {
    if (body.value) {
      return (
        <div key={i} data-target={target}>
          {body.value}
        </div>
      );
    } else if (body.type === "Image") {
      return <img src={body.id} key={i} data-target={target} />;
    }
  }

  if (Array.isArray(item.body)) {
    return (
      <Item onClick={handleClick} data-target={item.target}>
        {item.body.map((body, i) => renderItemBody(body, item.target, i))}
      </Item>
    );
  }

  return (
    <Item onClick={handleClick} data-target={item.target}>
      {renderItemBody(item.body, item.target)}
    </Item>
  );
};

export default AnnotationItem;
