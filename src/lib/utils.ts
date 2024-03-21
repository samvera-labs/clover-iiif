export const cleanTime = (standardNotation: string) => {
  const array = standardNotation.toString().split(":");
  const hours: number = Math.ceil(parseInt(array[0]));
  const minutes: number = Math.ceil(parseInt(array[1]));
  const seconds: string = zeroPad(Math.ceil(parseInt(array[2])), 2);

  // Insure time with Hours is formatted as "HH:MM:SS"
  const formattedMinutes =
    hours !== 0 && minutes < 10 ? (minutes + "").padStart(2, "0") : minutes;

  let time: string = `${formattedMinutes}:${seconds}`;

  if (hours !== 0) {
    time = `${hours}:${time}`;
  }

  return time;
};

export const convertTime = (duration: number) => {
  const standardNotation: string = new Date(duration * 1000)
    .toISOString()
    .substr(11, 8);
  return cleanTime(standardNotation);
};

export const convertTimeToSeconds = (standardNotation: string) => {
  const hms: Array<string> = standardNotation.split(":");
  const seconds: number = +hms[0] * 60 * 60 + +hms[1] * 60 + +hms[2];
  return seconds;
};

export const deepMerge = (target, source) => {
  if (typeof target !== "object" || target === null) {
    return source;
  }

  for (const key in source) {
    if (
      typeof source[key] === "object" &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {};
      target[key] = deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }

  return target;
};

export const hashCode = (s: string) => {
  return s.split("").reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
};

export const getRealPropertyValue = (
  obj: { [key: string]: any },
  property: string,
) => {
  const value = Object.hasOwn(obj, property)
    ? obj[property].toString()
    : undefined;
  return value;
};

const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, "0");
