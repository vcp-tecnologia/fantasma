/* @flow */

/**
* Return a timestamp with the format "yyyy-mm-dddThh:MM:ss"
*/
export const timestamp = (): string => {
  // Create a date object with the current time
  const now = new Date();
  let date: Array<string> = [ String(now.getFullYear()),
                              String(now.getMonth() + 1),
                              String(now.getDate()) ];
  let time: Array<string> = [ String(now.getHours()),
                              String(now.getMinutes()),
                              String(now.getSeconds()) ];
  // Pad with zeroes if necessary
  for ( let i = 1; i < 3; i++ ) {
    if ( parseInt(date[i]) < 10 ) {
      date[i] = "0" + date[i];
    }
    if ( parseInt(time[i]) < 10 ) {
      time[i] = "0" + time[i];
    }
  }

  return date.join("-") + "T" + time.join(":");
}
