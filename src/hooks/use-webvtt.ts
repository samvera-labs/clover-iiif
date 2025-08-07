// @ts-nocheck

import { v4 as uuidv4 } from "uuid";
import * as webvtt from "node-webvtt";

export interface NodeWebVttCue {
  identifier?: string;
  start: number;
  end: number;
  html: string;
  text: string;
  styles?: string;
  align?: "start" | "left" | "center" | "middle" | "end" | "right";
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
   * is an object with properties identifier, start, end, html, text, and align. It
   * iterates through the array of items and uses a stack to keep track of nested
   * items. It compares the current item's start with the end of the items in the
   * stack. If the current item's start is smaller than the end of the top item
   * in the stack, it is considered a child of the top item and added to its
   * children property. If the current item's start is greater than the end
   * of the top item in the stack, it is considered a top-level item and added to
   * the nestedItems array. The resulting nestedItems array contains the items
   * organized into nested structures based on their start and end values.
   */
  function createNestedCues(
    flat: Array<NodeWebVttCue>,
  ): Array<NodeWebVttCueNested> {
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

  // Replace VTT-style <tag.class1.class1 annotation> with
  // HTML-style <tag class="class1 class2" title="annotation">
  function normalizeVttTags(text) {
    const result = text.replace(
      /<(c|v|i|b|u|lang|ruby)(?:\.([^\s>]+))?(?:\s([^>]+))?>/g,
      (match, tag, classes, title) => {
        const e = document.createElement(tag);
        if (classes) {
          e.className = classes.replace(/\./g, " ");
        }
        if (title?.length > 0) {
          e.title = title;
        }
        return e.outerHTML.replace(new RegExp(`</${tag}>$`), "");
      },
    );
    console.log("normalizeVttTags", result);
    return result;
  }

  function createSpans(element: Element) {
    for (const child of element.children) {
      createSpans(child);
    }
    if (element.localName === "c" || element.localName === "v") {
      const el = document.createElement("span");
      for (const attr of element.attributes) {
        el.setAttribute(attr.name, attr.value);
      }
      el.innerHTML = element.innerHTML;
      element.parentNode?.replaceChild(el, element);
    }
  }

  function htmlCue(text): string {
    const cueText = normalizeVttTags(text);
    const el = document.createElement("div");
    el.innerHTML = cueText;
    createSpans(el);
    return el.innerHTML;
  }

  function parseVttData(data: string): Promise<Array<NodeWebVttCue>> {
    return new Promise((resolve, reject) => {
      const parsed = webvtt.parse(data);
      if (parsed.errors && parsed.errors.length) {
        reject(parsed.errors);
      }

      resolve(
        parsed.cues.map((cue) => ({
          identifier: cue.identifier || uuidv4(),
          start: cue.start,
          end: cue.end,
          align: cue.align,
          html: htmlCue(cue.text),
          text: cue.text || "",
        })),
      );
    });
  }

  return {
    addIdentifiersToParsedCues,
    createNestedCues,
    isChild,
    orderCuesByTime,
    parseVttData,
  };
};

export default useWebVtt;
