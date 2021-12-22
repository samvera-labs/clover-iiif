import { v4 as uuidv4 } from "uuid";

export interface NodeWebVttCue {
  identifier?: string;
  start: number;
  end: number;
  text: string;
  styles?: string;
}
export interface NodeWebVttCueNested extends NodeWebVttCue {
  children?: Array<NodeWebVttCueNested>;
}

const useWebVtt = () => {
  function addIdentifiersToParsedCues(
    cues: Array<NodeWebVttCue>,
  ): Array<NodeWebVttCue> {
    const newCues = cues.map((cue) => {
      const identifier = cue.identifier || uuidv4();
      return { ...cue, identifier };
    });
    return newCues;
  }

  function createNestedCues(flat: Array<NodeWebVttCue>): Array<NodeWebVttCue> {
    // Add identifier values to any cues which don't have them
    const idCues = addIdentifiersToParsedCues(flat);
    console.log(`idCues`, idCues);

    function getNestedChildren(
      arr: Array<NodeWebVttCueNested>,
      parent: string | null | undefined,
    ) {
      const out: Array<NodeWebVttCueNested> = [];

      arr.forEach((item) => {
        // Grab parent cues if they exist
        const currentItemParents = arr.filter((arrItem) => {
          return (
            item.start >= arrItem.start &&
            item.end < arrItem.end &&
            item.identifier !== arrItem.identifier
          );
        });

        // An item in the flat list could have multiple parents,
        // so lets find the most specific parent.  Let's sort the parents
        // by smallest window of time between "start" and "end"
        // values.  Then we pick the first element, which could be "undefined"
        // for root level cues.
        const currentItemParent = currentItemParents.sort((a, b) => {
          const aDuration = a.end - a.start;
          const bDuration = b.end - b.start;
          if (aDuration === bDuration) return 0;
          return aDuration < bDuration ? -1 : 1;
        })[0];

        // Is the current item's parent same as target parent?
        if (
          (!currentItemParent && !parent) ||
          currentItemParent?.identifier === parent
        ) {
          // Find children of the current item
          const children = getNestedChildren(arr, item.identifier);

          if (children.length) {
            item.children = children;
          }

          out.push(item);
        }
      });

      return out;
    }

    const nestedCues = getNestedChildren(idCues, null);
    return nestedCues;
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
