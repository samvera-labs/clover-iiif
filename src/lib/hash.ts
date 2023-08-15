const hash = (s: string) => {
  var h = 0,
    l = s?.length,
    i = 0;
  if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  return h;
};

export default hash;
