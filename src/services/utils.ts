export const cleanTime = (standardNotation: string) => {
  var array = standardNotation.toString().split(":");
  var hours: number = Math.ceil(parseInt(array[0]));
  var minutes: number = Math.ceil(parseInt(array[1]));
  var seconds: string = zeroPad(Math.ceil(parseInt(array[2])), 2);

  let time: string = `${minutes}:${seconds}`;

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
  var hms: Array<string> = standardNotation.split(":");
  var seconds: number = +hms[0] * 60 * 60 + +hms[1] * 60 + +hms[2];
  return seconds;
};

const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, "0");
