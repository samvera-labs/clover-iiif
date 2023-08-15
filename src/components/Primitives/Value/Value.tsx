import React from "react";
import { PrimitivesValue } from "src/types/primitives";
import Markup from "src/components/Primitives/Markup/Markup";

const Value: React.FC<PrimitivesValue> = ({ as = "dd", lang, value }) => (
  <Markup markup={value} as={as} lang={lang} />
);

export default Value;
