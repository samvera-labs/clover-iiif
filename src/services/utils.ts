export const cleanTime = (standardNotation: String) => {
  var array = standardNotation.split(":");
  var hours: number = Math.ceil(parseInt(array[0]));
  var minutes: number = Math.ceil(parseInt(array[1]));
  var seconds: string = zeroPad(Math.ceil(parseInt(array[2])), 2);

  let time: string = `${minutes}:${seconds}`;

  if (hours !== 0) {
    time = `${hours}:${time}`;
  }

  return time;
};

const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, "0");
