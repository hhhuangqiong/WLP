export function arrayToObject(arr) {
  return arr.map((item) => ({
    value: item,
    label: item,
  }));
}
