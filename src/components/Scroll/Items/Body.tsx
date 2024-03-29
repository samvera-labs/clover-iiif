import React, { useContext, useEffect, useState } from "react";

import { ScrollContext } from "src/context/scroll-context";
import { TextualBody } from "src/components/Scroll/Items/Body.styled";

const ScrollItemBody = ({ body }) => {
  const [value, setValue] = useState<string>("");

  const { state } = useContext(ScrollContext);
  const { searchString } = state;

  useEffect(() => {
    let value = body?.value;

    if (body?.format === "text/plain") {
      const regex = /\n/g;
      const newLineToBreak = "<br />";
      value = value?.replace(regex, newLineToBreak);
    }

    // search the value for the search string and wrap the matches in a span
    if (searchString) {
      const regex = new RegExp(searchString, "gi");
      value = value?.replace(regex, (match) => {
        return `<span class="highlight">${match}</span>`;
      });
    }

    setValue(value);
  }, [body, searchString]);

  if (!value) return null;

  return (
    <TextualBody
      dangerouslySetInnerHTML={{ __html: value }}
      data-body-id={body.id}
      data-testid="scroll-item-body"
      id={body.id}
    />
  );
};

export default ScrollItemBody;
