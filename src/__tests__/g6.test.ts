import { expect, test } from 'vitest';

import { cellToG6, cellVolume, g6ToCell, g6Volume } from '../g6.ts';
import { g6Distance } from '../g6Distance.ts';

test('a cell is its metric, in Å², and back', () => {
  const cell = { a: 3, b: 4, c: 5, alpha: 90, beta: 90, gamma: 120 };
  const g6 = cellToG6(cell);

  expect(g6[0]).toBe(9);
  expect(g6[1]).toBe(16);
  expect(g6[2]).toBe(25);
  expect(g6[3]).toBeCloseTo(0, 12);
  expect(g6[4]).toBeCloseTo(0, 12);
  expect(g6[5]).toBeCloseTo(-12, 12);

  const back = g6ToCell(g6);

  expect(back.a).toBeCloseTo(3, 12);
  expect(back.gamma).toBeCloseTo(120, 10);
  expect(back.alpha).toBeCloseTo(90, 10);
});

test('the volume is the root of the metric’s determinant', () => {
  expect(
    cellVolume({ a: 2, b: 3, c: 4, alpha: 90, beta: 90, gamma: 90 }),
  ).toBeCloseTo(24, 12);
  // A rhombohedron of edge 1 and angle 60° is a quarter of a cube of edge √2.
  expect(g6Volume([1, 1, 1, 1, 1, 1])).toBeCloseTo(Math.SQRT2 / 2, 12);
});

test('six numbers that make no cell are refused', () => {
  expect(() =>
    cellToG6({ a: 0, b: 1, c: 1, alpha: 90, beta: 90, gamma: 90 }),
  ).toThrow('A cell edge must be positive: got a = 0, b = 1, c = 1.');
  // Three angles summing past 360° close no corner.
  expect(() =>
    cellToG6({ a: 1, b: 1, c: 1, alpha: 150, beta: 150, gamma: 150 }),
  ).toThrow('No three vectors make the angles α = 150°, β = 150°, γ = 150°.');
});

test('the distance between two G6 vectors is Euclidean', () => {
  expect(g6Distance([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6])).toBe(0);
  expect(g6Distance([0, 0, 0, 0, 0, 0], [3, 4, 0, 0, 0, 0])).toBe(5);
});
