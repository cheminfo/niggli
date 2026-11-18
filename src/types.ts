/**
 * A unit cell: three edges in ångström, three angles in degrees.
 */
export interface CellParameters {
  a: number;
  b: number;
  c: number;
  /**
   * Angle between b and c, in degrees.
   */
  alpha: number;
  /**
   * Angle between a and c, in degrees.
   */
  beta: number;
  /**
   * Angle between a and b, in degrees.
   */
  gamma: number;
}

/**
 * A cell as the six numbers of its metric, in Å²:
 * `[a·a, b·b, c·c, 2 b·c, 2 a·c, 2 a·b]`, written A, B, C, ξ, η, ζ by Křivý and
 * Gruber and G6 by Andrews and Bernstein.
 */
export type G6 = [number, number, number, number, number, number];

/**
 * A 3 × 3 matrix, row by row.
 */
export type Matrix3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

/**
 * The centring of a conventional cell, as the first letter of its
 * Hermann–Mauguin symbol. `R` is a rhombohedral lattice on hexagonal axes, in
 * the obverse setting; on rhombohedral axes the cell is already primitive and
 * is `P`.
 */
export type Centring = 'P' | 'A' | 'B' | 'C' | 'I' | 'F' | 'R';
