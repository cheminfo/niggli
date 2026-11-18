import { expect, test } from 'vitest';

import { isNiggliReduced } from '../isNiggliReduced.ts';

test('a cell breaking a main condition is not reduced', () => {
  // a longer than b.
  expect(isNiggliReduced([16, 9, 25, 0, 0, 0])).toBe(false);
  // |2 a·b| longer than a·a.
  expect(isNiggliReduced([9, 16, 25, 0, 0, 10])).toBe(false);
  // Two angles acute and one obtuse.
  expect(isNiggliReduced([9, 16, 25, 2, 2, -2])).toBe(false);
  expect(isNiggliReduced([9, 16, 25, 0, 0, 0])).toBe(true);
});

test('a cell on a boundary is reduced only on the side the special conditions pick', () => {
  // Hexagonal: ζ = −A requires η = 0.
  expect(isNiggliReduced([9, 9, 25, 0, 0, -9])).toBe(true);
  expect(isNiggliReduced([9, 9, 25, 0, -2, -9])).toBe(false);
  // A = B requires |ξ| ≤ |η|.
  expect(isNiggliReduced([9, 9, 25, -1, -2, -3])).toBe(true);
  expect(isNiggliReduced([9, 9, 25, -2, -1, -3])).toBe(false);
});
