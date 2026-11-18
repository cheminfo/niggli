import { g6Volume } from './g6.ts';
import type { G6 } from './types.ts';

/**
 * How {@link isNiggliReduced} compares.
 */
export interface IsNiggliReducedOptions {
  /**
   * The tolerance of every comparison, relative to the size of the cell: it is
   * multiplied by V^(2/3), as `niggliReduce` does.
   * @default 1e-5
   */
  tolerance?: number;
}

/**
 * Whether a cell is a Niggli cell: the main and the special conditions of
 * the International Tables, vol. A, section 3.1.3.
 * @param g6 - The cell, as `[A, B, C, ξ, η, ζ]` in Å².
 * @param options - See {@link IsNiggliReducedOptions}.
 * @returns True when every condition holds within the tolerance.
 */
export function isNiggliReduced(
  g6: Readonly<G6>,
  options: IsNiggliReducedOptions = {},
): boolean {
  const { tolerance = 1e-5 } = options;
  const volume = g6Volume(g6);
  const epsilon = tolerance * Math.cbrt(volume * volume);
  const isLess = (x: number, y: number) => x < y - epsilon;
  const isGreater = (x: number, y: number) => isLess(y, x);
  const isEqual = (x: number, y: number) => !isLess(x, y) && !isLess(y, x);
  const [A, B, C, xi, eta, zeta] = g6;

  if (
    isGreater(A, B) ||
    isGreater(B, C) ||
    isGreater(Math.abs(xi), B) ||
    isGreater(Math.abs(eta), A) ||
    isGreater(Math.abs(zeta), A)
  ) {
    return false;
  }
  const isAllAcute =
    isGreater(xi, 0) && isGreater(eta, 0) && isGreater(zeta, 0);
  const isNoneAcute =
    !isGreater(xi, 0) && !isGreater(eta, 0) && !isGreater(zeta, 0);
  if (!isAllAcute && !isNoneAcute) return false;
  if (isEqual(A, B) && isGreater(Math.abs(xi), Math.abs(eta))) return false;
  if (isEqual(B, C) && isGreater(Math.abs(eta), Math.abs(zeta))) return false;

  if (isAllAcute) {
    return !(
      (isEqual(xi, B) && isGreater(zeta, 2 * eta)) ||
      (isEqual(eta, A) && isGreater(zeta, 2 * xi)) ||
      (isEqual(zeta, A) && isGreater(eta, 2 * xi))
    );
  }
  const sum = xi + eta + zeta + A + B;
  return !(
    isLess(sum, 0) ||
    (isEqual(xi, -B) && !isEqual(zeta, 0)) ||
    (isEqual(eta, -A) && !isEqual(zeta, 0)) ||
    (isEqual(zeta, -A) && !isEqual(eta, 0)) ||
    (isEqual(sum, 0) && isGreater(2 * (A + eta) + zeta, 0))
  );
}
