import Markup from "src/components/Primitives/Markup/Markup";
import { PrimitivesValue } from "src/types/primitives";
import React from "react";

const Value: React.FC<PrimitivesValue> = ({ as = "dd", lang, value }) => (
  <Markup markup={value} as={as} lang={lang} />
);

export default Value;
