import { expect, test } from 'vitest';

import { cellToG6, g6ToCell, g6Volume } from '../g6.ts';
import { g6Distance } from '../g6Distance.ts';
import { isNiggliReduced } from '../isNiggliReduced.ts';
import { determinant } from '../matrix.ts';
import { niggliReduce } from '../niggliReduce.ts';
import type { CellParameters, G6 } from '../types.ts';

import {
  randomCells,
  relativeDifference,
  transformCell,
  transformedG6,
  unimodularMatrices,
} from './lattices.ts';

test('Křivý and Gruber’s own example reduces to the cell they give', () => {
  const given: G6 = [9, 27, 4, -5, -4, -22];
  const reduced = niggliReduce(g6ToCell(given));

  expect(relativeDifference(reduced.g6, [4, 9, 9, 9, 3, 4])).toBeLessThan(
    1e-12,
  );
  expect(isNiggliReduced(reduced.g6)).toBe(true);
  expect(determinant(reduced.transformation)).toBe(1);
  // The transformation takes the cell given to the reduced one.
  expect(
    relativeDifference(
      transformedG6(given, reduced.transformation),
      reduced.g6,
    ),
  ).toBeLessThan(1e-12);
});

test('face-centred cubic copper reduces to its rhombohedron of 60°', () => {
  const { cell, transformation } = niggliReduce(
    { a: 3.615, b: 3.615, c: 3.615, alpha: 90, beta: 90, gamma: 90 },
    { centring: 'F' },
  );

  expect(rounded(cell)).toStrictEqual({
    a: 2.556191,
    b: 2.556191,
    c: 2.556191,
    alpha: 60,
    beta: 60,
    gamma: 60,
  });
  expect(determinant(transformation)).toBeCloseTo(0.25, 12);
});

test('body-centred cubic iron reduces to its rhombohedron of 109.47°', () => {
  const { cell } = niggliReduce(
    { a: 2.8665, b: 2.8665, c: 2.8665, alpha: 90, beta: 90, gamma: 90 },
    { centring: 'I' },
  );

  expect(rounded(cell)).toStrictEqual({
    a: 2.482462,
    b: 2.482462,
    c: 2.482462,
    alpha: 109.471221,
    beta: 109.471221,
    gamma: 109.471221,
  });
});

test('a hexagonal cell is already reduced, and comes back as it went in', () => {
  const magnesium = {
    a: 3.2094,
    b: 3.2094,
    c: 5.2108,
    alpha: 90,
    beta: 90,
    gamma: 120,
  };
  const { cell, transformation } = niggliReduce(magnesium);

  expect(rounded(cell)).toStrictEqual(magnesium);
  expect(transformation).toStrictEqual([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);
});

test('two cells of aspirin form II, written with β on either side of 90°, reduce to one', () => {
  // COD 2104857 (293 K) and 7247818 (296 K): the same phase.
  const acute = {
    a: 12.2696,
    b: 6.5575,
    c: 11.496,
    alpha: 90,
    beta: 68.163,
    gamma: 90,
  };
  const obtuse = {
    a: 12.2633,
    b: 6.5624,
    c: 11.4726,
    alpha: 90,
    beta: 111.627,
    gamma: 90,
  };

  expect(g6Distance(cellToG6(acute), cellToG6(obtuse))).toBeGreaterThan(200);

  const first = niggliReduce(acute);
  const second = niggliReduce(obtuse);

  expect(g6Distance(first.g6, second.g6)).toBeLessThan(2);
  expect(rounded(first.cell).a).toBe(6.5575);
  expect(rounded(second.cell).a).toBe(6.5624);
});

test('every basis of a lattice reduces to the same Niggli cell', () => {
  const cells = randomCells(20_261_118, 200);
  const changes = unimodularMatrices(42, 6);
  let checked = 0;
  for (const cell of cells) {
    const reference = niggliReduce(cell);

    expect(isNiggliReduced(reference.g6)).toBe(true);

    for (const change of changes) {
      const other = niggliReduce(transformCell(cell, change));

      expect(relativeDifference(other.g6, reference.g6)).toBeLessThan(1e-9);
      expect(determinant(other.transformation)).toBe(1);

      checked++;
    }
  }

  expect(checked).toBe(1200);
});

test('lattices on the boundaries of the reduced domain reduce the same from any basis', () => {
  const special: Array<[string, CellParameters]> = [
    ['cubic', { a: 4, b: 4, c: 4, alpha: 90, beta: 90, gamma: 90 }],
    ['tetragonal', { a: 4, b: 4, c: 7, alpha: 90, beta: 90, gamma: 90 }],
    ['hexagonal', { a: 3, b: 3, c: 5, alpha: 90, beta: 90, gamma: 120 }],
    ['rhombohedral', { a: 5, b: 5, c: 5, alpha: 75, beta: 75, gamma: 75 }],
    ['monoclinic', { a: 5, b: 6, c: 7, alpha: 90, beta: 100, gamma: 90 }],
  ];
  const changes = unimodularMatrices(7, 20, 8);
  const found: Array<[string, boolean, number]> = [];
  for (const [name, cell] of special) {
    const reference = niggliReduce(cell);
    let largest = 0;
    for (const change of changes) {
      const other = niggliReduce(transformCell(cell, change));
      largest = Math.max(largest, relativeDifference(other.g6, reference.g6));
    }
    found.push([
      name,
      isNiggliReduced(reference.g6),
      largest < 1e-9 ? 0 : largest,
    ]);
  }

  expect(found).toStrictEqual(special.map(([name]) => [name, true, 0]));
});

test('reducing keeps the volume, and a reduced cell stays as it is', () => {
  for (const cell of randomCells(5, 50)) {
    const { g6 } = niggliReduce(cell);

    expect(g6Volume(g6)).toBeCloseTo(g6Volume(cellToG6(cell)), 8);
    expect(niggliReduce(g6ToCell(g6)).transformation).toStrictEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  }
});

test('a reduction that does not converge in the passes it is allowed says so', () => {
  const skewed = transformCell(
    { a: 4, b: 5, c: 6, alpha: 80, beta: 85, gamma: 95 },
    [
      [1, 7, 3],
      [0, 1, 5],
      [0, 0, 1],
    ],
  );

  expect(() => niggliReduce(skewed, { maxIterations: 1 })).toThrow(
    'The Niggli reduction did not converge in 1 passes.',
  );
});

function round(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function rounded(cell: CellParameters): CellParameters {
  return {
    a: round(cell.a),
    b: round(cell.b),
    c: round(cell.c),
    alpha: round(cell.alpha),
    beta: round(cell.beta),
    gamma: round(cell.gamma),
  };
}
