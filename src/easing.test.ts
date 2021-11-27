import { easeInOutQuad, easeInOutQuadReverse } from "./easing";

test("is isomorphic", () => {
  for (let x = 0; x <= 1; x += 0.1) {
    const x2 = easeInOutQuad(x);
    const x3 = easeInOutQuadReverse(x2);
    expect(x3).toBeCloseTo(x);
  }
});
