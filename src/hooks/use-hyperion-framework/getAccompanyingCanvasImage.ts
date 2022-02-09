export const getAccompanyingCanvasImage = (
  items: Array<any> = [],
): string | undefined => {
  if (items.length === 0) return;
  try {
    // I know there is a better way to do this, and want
    // to chat about it Mat.
    return items[0].items[0].body?.id;
  } catch (e) {
    console.error("Error retrieving accompanying canvas image", e);
    return;
  }
};
