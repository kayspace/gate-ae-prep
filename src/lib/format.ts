export function fmtSize(n: number) {
  if (n > 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} mb`;
  return `${Math.round(n / 1024)} kb`;
}
