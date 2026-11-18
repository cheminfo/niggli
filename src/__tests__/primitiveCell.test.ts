import { expect, test } from 'vitest';

import { cellVolume } from '../g6.ts';
import { determinant } from '../matrix.ts';
import { primitiveCell } from '../primitiveCell.ts';
import type { Centring } from '../types.ts';

const CUBE = { a: 4, b: 4, c: 4, alpha: 90, beta: 90, gamma: 90 };

test('each centring divides the cell by the lattice points it adds', () => {
  const points: Array<[Centring, number]> = [
    ['P', 1],
    ['A', 2],
    ['B', 2],
    ['C', 2],
    ['I', 2],
    ['F', 4],
    ['R', 3],
  ];
  const ratios: Array<[Centring, number, number]> = [];
  for (const [centring] of points) {
    const { cell, transformation } = primitiveCell(CUBE, centring);
    ratios.push([
      centring,
      Math.round(cellVolume(CUBE) / cellVolume(cell)),
      Math.round(1 / determinant(transformation)),
    ]);
  }

  expect(ratios).toStrictEqual(
    points.map(([centring, count]) => [centring, count, count]),
  );
});

test('face-centred cubic is a rhombohedron of 60°, body-centred one of 109.47°', () => {
  const fcc = primitiveCell(CUBE, 'F').cell;

  expect(fcc.a).toBeCloseTo(2 * Math.SQRT2, 12);
  expect(fcc.alpha).toBeCloseTo(60, 10);
  expect(fcc.gamma).toBeCloseTo(60, 10);

  const bcc = primitiveCell(CUBE, 'I').cell;

  expect(bcc.a).toBeCloseTo(2 * Math.sqrt(3), 12);
  expect(bcc.alpha).toBeCloseTo(109.4712206, 6);
});
