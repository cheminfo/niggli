import { determinant, metricOfG6 } from './matrix.ts';
import type { CellParameters, G6 } from './types.ts';

const DEGREES = Math.PI / 180;

/**
 * The G6 vector of a cell: `[a², b², c², 2bc cos α, 2ac cos β, 2ab cos γ]`.
 * @param cell - Edges in ångström, angles in degrees.
 * @returns The G6 vector, in Å².
 * @throws {RangeError} When the six parameters describe no cell: an edge that
 * is not positive, or angles no three vectors can make.
 */
export function cellToG6(cell: Readonly<CellParameters>): G6 {
  const { a, b, c, alpha, beta, gamma } = cell;
  if (!(a > 0 && b > 0 && c > 0)) {
    throw new RangeError(
      `A cell edge must be positive: got a = ${a}, b = ${b}, c = ${c}.`,
    );
  }
  const g6: G6 = [
    a * a,
    b * b,
    c * c,
    2 * b * c * Math.cos(alpha * DEGREES),
    2 * a * c * Math.cos(beta * DEGREES),
    2 * a * b * Math.cos(gamma * DEGREES),
  ];
  if (!(g6Volume(g6) > 0)) {
    throw new RangeError(
      `No three vectors make the angles α = ${alpha}°, β = ${beta}°, γ = ${gamma}°.`,
    );
  }
  return g6;
}

/**
 * The cell of a G6 vector.
 * @param g6 - `[A, B, C, ξ, η, ζ]`, in Å².
 * @returns Edges in ångström, angles in degrees.
 */
export function g6ToCell(g6: Readonly<G6>): CellParameters {
  const [A, B, C, xi, eta, zeta] = g6;
  const a = Math.sqrt(A);
  const b = Math.sqrt(B);
  const c = Math.sqrt(C);
  return {
    a,
    b,
    c,
    alpha: angle(xi / (2 * b * c)),
    beta: angle(eta / (2 * a * c)),
    gamma: angle(zeta / (2 * a * b)),
  };
}

/**
 * The volume of the cell a G6 vector describes.
 * @param g6 - `[A, B, C, ξ, η, ζ]`, in Å².
 * @returns The volume in Å³, or `NaN` for six numbers no cell has.
 */
export function g6Volume(g6: Readonly<G6>): number {
  return Math.sqrt(determinant(metricOfG6(g6)));
}

/**
 * The volume of a cell.
 * @param cell - Edges in ångström, angles in degrees.
 * @returns The volume in Å³.
 */
export function cellVolume(cell: Readonly<CellParameters>): number {
  return g6Volume(cellToG6(cell));
}

/**
 * An angle from its cosine; rounding past ±1 is brought back.
 * @param cosine - The cosine.
 * @returns The angle, in degrees.
 */
function angle(cosine: number): number {
  return Math.acos(Math.min(1, Math.max(-1, cosine))) / DEGREES;
}
