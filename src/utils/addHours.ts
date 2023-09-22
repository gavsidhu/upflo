export function addHours(hours: number) {
  if (hours === 0) {
    return 0;
  } else {
    return 1000 * 60 * 60 * hours;
  }
}
