import type { G6 } from './types.ts';

/**
 * The Euclidean distance between two G6 vectors, in Å².
 *
 * Between two Niggli cells it says how alike the two lattices are, which is
 * what a "similar cell" search ranks by. It is the simple metric: two lattices
 * lying on either side of a boundary of the reduced domain can reduce to
 * vectors further apart than the lattices are, which Andrews and Bernstein's
 * NCDist (J. Appl. Cryst. 47 (2014) 346–359) accounts for and this does not.
 * @param first - One G6 vector.
 * @param second - The other.
 * @returns The distance, in Å².
 */
export function g6Distance(first: Readonly<G6>, second: Readonly<G6>): number {
  const [a1, b1, c1, xi1, eta1, zeta1] = first;
  const [a2, b2, c2, xi2, eta2, zeta2] = second;
  return Math.hypot(
    a1 - a2,
    b1 - b2,
    c1 - c2,
    xi1 - xi2,
    eta1 - eta2,
    zeta1 - zeta2,
  );
}
