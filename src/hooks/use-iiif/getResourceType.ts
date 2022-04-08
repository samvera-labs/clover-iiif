export const getResourceType = (annotation: any): string => {
  if (!annotation.body) return "Image";

  return annotation.body.type;
};
