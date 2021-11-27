export function easeInOutQuad(x: number): number {
  if (x < 0.5) {
    return x * x;
  } else {
    return 1 - Math.pow(-2 * x + 2, 2) / 2;
  }
}
export function easeInOutQuadReverse(x: number): number {
  if (x < 0.5) {
    return Math.sqrt(x);
  } else {
    return 0 - (Math.sqrt(-2 * x + 2) - 2) / 2;
  }
}
