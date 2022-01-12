import React from "react";
import { NodeWebVttCueNested } from "hooks/use-webvtt";
import Cue from "components/Navigator/Cue";
import { MenuStyled, MenuItemStyled } from "components/Navigator/Menu.styled";

interface MenuProps {
  currentTime: number;
  items: Array<NodeWebVttCueNested>;
}

interface MenuItemProps {
  isActive?: boolean;
}

const Menu: React.FC<MenuProps> = ({ currentTime, items }) => {
  console.log(`renders`);
  return (
    <MenuStyled>
      {items.map(({ text, start, end, children: cueChildren, identifier }) => {
        const isCueActive: boolean = start <= currentTime && currentTime < end;

        /**
         * Spinner: Only the top level MenuItem in a tree can be "active"
         * Cue: Should be bold if "active"
         *
         * 1. Is current item top level (ie. no "children" property)?
         * 2. Is current item currently active against currentTime
         *
         * Other thoughts: This whole component renders A LOT.  Can we move
         * the renders down to the MenuItem or Cue component so its not
         * re-building the tree every time?   This would involve bypassing sending
         * in "currentTime" as a direct prop...
         */
        const isParent = false;

        return (
          <MenuItem key={identifier} isActive={isCueActive && !isParent}>
            <Cue isActive={isCueActive} label={text} time={start} />
            {cueChildren && (
              <Menu currentTime={currentTime} items={cueChildren} />
            )}
          </MenuItem>
        );
      })}
    </MenuStyled>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({ children, isActive }) => {
  return <MenuItemStyled isActive={isActive}>{children}</MenuItemStyled>;
};

export default Menu;
