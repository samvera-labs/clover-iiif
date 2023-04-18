import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

export interface NodeWebVttCue {
  identifier?: string;
  start: number;
  end: number;
  text: string;
  styles?: string;
  children?: Array<NodeWebVttCue>;
}
export interface NodeWebVttCueNested extends NodeWebVttCue {
  children?: Array<NodeWebVttCueNested>;
}

const useWebVtt = () => {
  function addIdentifiersToParsedCues(
    cues: Array<NodeWebVttCue>,
  ): Array<NodeWebVttCue> {
    return cues.map((cue) => {
      const identifier = cue.identifier || uuidv4();
      return { ...cue, identifier };
    });
  }

  /**
   * This function takes an array of NodeWebVttCue items as input, where each item
   * is an object with properties identifier, start, end, text, and styles. It
   * iterates through the array of items and uses a stack to keep track of nested
   * items. It compares the current item's start with the end of the items in the
   * stack. If the current item's start is smaller than the end of the top item
   * in the stack, it is considered a child of the top item and added to its
   * children property. If the current item's start is greater than the end
   * of the top item in the stack, it is considered a top-level item and added to
   * the nestedItems array. The resulting nestedItems array contains the items
   * organized into nested structures based on their start and end values.
   */
  function createNestedCues(flat: Array<NodeWebVttCue>): Array<NodeWebVttCue> {
    const nestedItems = [];
    const stack = [];

    const cues = addIdentifiersToParsedCues(flat);

    for (const item of cues) {
      while (stack.length > 0 && stack[stack.length - 1].end <= item.start) {
        stack.pop();
      }

      if (stack.length > 0) {
        if (!stack[stack.length - 1].children) {
          stack[stack.length - 1].children = [];
        }
        stack[stack.length - 1].children?.push(item);
        stack.push(item);
      } else {
        nestedItems.push(item);
        stack.push(item);
      }
    }

    return nestedItems;
  }

  /**
   * Is a cue a child of another cue
   * @param cue Object
   * @param cues Array
   * @returns Boolean
   */
  function isChild(
    cue: NodeWebVttCue,
    cues: Array<NodeWebVttCue> = [],
  ): boolean {
    return cues.some(
      (currentCue) =>
        cue.start >= currentCue.start && cue.end <= currentCue.end,
    );
  }

  /**
   * Sort Cues by cue start time
   * @param cues
   * @returns Array
   */
  function orderCuesByTime(
    cues: Array<NodeWebVttCue> = [],
  ): Array<NodeWebVttCue> {
    return cues.sort((cue1, cue2) => cue1.start - cue2.start);
  }

  return {
    addIdentifiersToParsedCues,
    createNestedCues,
    isChild,
    orderCuesByTime,
  };
};

export default useWebVtt;
