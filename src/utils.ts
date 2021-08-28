export function formatLargeNumber(number: number) {
  const num = Math.abs(Number(number));
  return num >= 1.0e+9
    ? (num / 1.0e+9).toFixed(2) + "B"
    : num >= 1.0e+6
      ? (num / 1.0e+6).toFixed(2) + "M"
      : num >= 1.0e+3
        ? (num / 1.0e+3).toFixed(2) + "K"
        : num;
}

export function formatPercentageChange(number: number) {
  return `${(number > 0 ? '+' : '')}${(number * 100).toFixed(2)}`;
}

export function randomInt(min: number, max?: number): number {
  if (!max) {
    max = min;
    min = 0;
  }

  const num = Math.floor(Math.random() * (max - min + 1) + min);
  return num
}

export function hasJsonContentType(contentType: string): boolean {
  const isString = typeof contentType === 'string';
  const hasJSON = contentType.includes('application/json');
  
  return isString && hasJSON;
}