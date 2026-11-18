import { XSadd } from 'ml-xsadd';

import { cellToG6, g6ToCell } from '../g6.ts';
import {
  g6OfMetric,
  identity,
  metricOfG6,
  multiply,
  transformMetric,
} from '../matrix.ts';
import type { CellParameters, G6, Matrix3 } from '../types.ts';

/**
 * Random integer basis changes of determinant +1, from a seed: products of
 * shears `column j += k · column i`, with k from -2 to 2.
 * @param seed - The seed.
 * @param count - How many to make.
 * @param shears - How many shears each is a product of.
 * @returns The matrices.
 */
export function unimodularMatrices(
  seed: number,
  count: number,
  shears = 6,
): Matrix3[] {
  const generator = new XSadd(seed);
  const matrices: Matrix3[] = [];
  for (let index = 0; index < count; index++) {
    let matrix = identity();
    for (let step = 0; step < shears; step++) {
      const from = generator.getUint32() % 3;
      const to = (from + 1 + (generator.getUint32() % 2)) % 3;
      const factor = [-2, -1, 1, 2][generator.getUint32() % 4] ?? 1;
      const entry = (row: number, column: number) => {
        if (row === column) return 1;
        return row === from && column === to ? factor : 0;
      };
      const shear: Matrix3 = [
        [entry(0, 0), entry(0, 1), entry(0, 2)],
        [entry(1, 0), entry(1, 1), entry(1, 2)],
        [entry(2, 0), entry(2, 1), entry(2, 2)],
      ];
      matrix = multiply(matrix, shear);
    }
    matrices.push(matrix);
  }
  return matrices;
}

/**
 * Random cells, from a seed: edges from 3 to 20 Å, angles from 60° to 120°,
 * any six that make a cell.
 * @param seed - The seed.
 * @param count - How many to make.
 * @returns The cells.
 */
export function randomCells(seed: number, count: number): CellParameters[] {
  const generator = new XSadd(seed);
  const cells: CellParameters[] = [];
  while (cells.length < count) {
    const cell = {
      a: randomEdge(generator),
      b: randomEdge(generator),
      c: randomEdge(generator),
      alpha: randomAngle(generator),
      beta: randomAngle(generator),
      gamma: randomAngle(generator),
    };
    try {
      cellToG6(cell);
      cells.push(cell);
    } catch {
      // Six numbers that make no cell are drawn again.
    }
  }
  return cells;
}

/**
 * An edge from 3 to 20 Å.
 * @param generator - The seeded generator.
 * @returns The edge.
 */
function randomEdge(generator: XSadd): number {
  return 3 + 17 * generator.getFloat();
}

/**
 * An angle from 60° to 120°.
 * @param generator - The seeded generator.
 * @returns The angle.
 */
function randomAngle(generator: XSadd): number {
  return 60 + 60 * generator.getFloat();
}

/**
 * The same lattice, on another basis.
 * @param cell - The cell.
 * @param transformation - P, with `[a' b' c'] = [a b c] · P`.
 * @returns The cell of the new basis.
 */
export function transformCell(
  cell: CellParameters,
  transformation: Matrix3,
): CellParameters {
  return g6ToCell(transformedG6(cellToG6(cell), transformation));
}

/**
 * A G6 vector on another basis.
 * @param g6 - The vector.
 * @param transformation - P, with `[a' b' c'] = [a b c] · P`.
 * @returns The G6 vector of the new basis.
 */
export function transformedG6(g6: G6, transformation: Matrix3): G6 {
  return g6OfMetric(transformMetric(metricOfG6(g6), transformation));
}

/**
 * The largest difference between two G6 vectors, relative to the largest of
 * their lengths.
 * @param first - One vector.
 * @param second - The other.
 * @returns The relative difference.
 */
export function relativeDifference(first: G6, second: G6): number {
  const scale = Math.max(first[0], first[1], first[2]);
  let largest = 0;
  for (let index = 0; index < 6; index++) {
    const difference = Math.abs((first[index] ?? 0) - (second[index] ?? 0));
    if (difference > largest) largest = difference;
  }
  return largest / scale;
}
