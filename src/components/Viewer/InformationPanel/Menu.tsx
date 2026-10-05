import Cue from "src/components/Viewer/InformationPanel/Annotation/VTT/Cue";
import { NodeWebVttCueNested } from "src/hooks/use-webvtt";
import React from "react";

interface MenuProps {
  items: Array<NodeWebVttCueNested>;
}
const Menu: React.FC<MenuProps> = ({ items }) => {
  return (
    <ul className="clover-viewer-annotation-menu">
      {items.map((item, index) => {
        const { html, text, start, end, children, identifier } = item;
        return (
          /*
           * `identifier` is optional on the cue type — a WebVTT file need not carry cue ids —
           * so a cue that reaches here without one would give every row the same `undefined`
           * key, and React would rebuild the list on each render rather than update it. The
           * timing is unique within a list and is the natural fallback.
           */
          <li key={identifier ?? `${start}-${end}-${index}`}>
            <Cue html={html} text={text} start={start} end={end} />
            {children && <Menu items={children} />}
          </li>
        );
      })}
    </ul>
  );
};
export default Menu;
