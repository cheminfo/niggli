import { cellToG6, g6ToCell } from './g6.ts';
import { g6OfMetric, identity, metricOfG6, transformMetric } from './matrix.ts';
import type { CellParameters, Centring, Matrix3 } from './types.ts';

/**
 * A cell and the basis change that made it.
 */
export interface TransformedCell {
  /**
   * The new cell.
   */
  cell: CellParameters;
  /**
   * P such that `[a' b' c'] = [a b c] · P`: its columns are the new vectors
   * written in the old basis.
   */
  transformation: Matrix3;
}

/**
 * A primitive cell of the lattice a centred cell describes.
 *
 * Any primitive cell of the lattice would do as the start of a reduction; these
 * are the ones of the International Tables, vol. A, table 5.1.3.1.
 * @param cell - The conventional cell, edges in ångström, angles in degrees.
 * @param centring - Its centring, the first letter of its Hermann–Mauguin
 * symbol.
 * @returns The primitive cell, and the transformation from the one given.
 */
export function primitiveCell(
  cell: Readonly<CellParameters>,
  centring: Centring,
): TransformedCell {
  const transformation = PRIMITIVE[centring]();
  const metric = transformMetric(metricOfG6(cellToG6(cell)), transformation);
  return { cell: g6ToCell(g6OfMetric(metric)), transformation };
}

/**
 * The primitive basis of each centring, as columns in the centred basis.
 */
const PRIMITIVE: Readonly<Record<Centring, () => Matrix3>> = {
  P: identity,
  // a, (b + c) / 2, (−b + c) / 2
  A: () => [
    [1, 0, 0],
    [0, 1 / 2, -1 / 2],
    [0, 1 / 2, 1 / 2],
  ],
  // (a − c) / 2, b, (a + c) / 2
  B: () => [
    [1 / 2, 0, 1 / 2],
    [0, 1, 0],
    [-1 / 2, 0, 1 / 2],
  ],
  // (a + b) / 2, (−a + b) / 2, c
  C: () => [
    [1 / 2, -1 / 2, 0],
    [1 / 2, 1 / 2, 0],
    [0, 0, 1],
  ],
  // (−a + b + c) / 2, (a − b + c) / 2, (a + b − c) / 2
  I: () => [
    [-1 / 2, 1 / 2, 1 / 2],
    [1 / 2, -1 / 2, 1 / 2],
    [1 / 2, 1 / 2, -1 / 2],
  ],
  // (b + c) / 2, (a + c) / 2, (a + b) / 2
  F: () => [
    [0, 1 / 2, 1 / 2],
    [1 / 2, 0, 1 / 2],
    [1 / 2, 1 / 2, 0],
  ],
  // Obverse: (2a + b + c) / 3, (−a + b + c) / 3, (−a − 2b + c) / 3
  R: () => [
    [2 / 3, -1 / 3, -1 / 3],
    [1 / 3, 1 / 3, -2 / 3],
    [1 / 3, 1 / 3, 1 / 3],
  ],
};
