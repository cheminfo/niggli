/**
 * The eight steps of the Křivý–Gruber reduction, each as the basis change it
 * makes, with the comparisons made against a tolerance as Grosse-Kunstleve,
 * Sauter and Adams wrote them (Acta Cryst. A60 (2004) 1–6), so a cell lying on
 * a boundary of the reduced domain does not cycle between its two sides.
 *
 * Each step returns the matrix P to apply, `[a' b' c'] = [a b c] · P`, or
 * `null` when its condition does not hold. Every matrix has determinant +1, so
 * the reduced cell keeps the hand of the one given.
 */

import type { Matrix3 } from './types.ts';

/**
 * The metric of the current basis, as the steps read it.
 */
export interface StepParameters {
  /**
   * a · a
   */
  A: number;
  /**
   * b · b
   */
  B: number;
  /**
   * c · c
   */
  C: number;
  /**
   * 2 b · c
   */
  xi: number;
  /**
   * 2 a · c
   */
  eta: number;
  /**
   * 2 a · b
   */
  zeta: number;
  /**
   * The tolerance every comparison is made with, in Å².
   */
  epsilon: number;
}

/**
 * Step 1: put the shortest of a and b first.
 * @param p - The current metric.
 * @returns The basis change, or `null`.
 */
export function step1(p: StepParameters): Matrix3 | null {
  const { A, B, xi, eta, epsilon } = p;
  if (
    A > B + epsilon ||
    (!(Math.abs(A - B) > epsilon) && Math.abs(xi) > Math.abs(eta) + epsilon)
  ) {
    return [
      [0, -1, 0],
      [-1, 0, 0],
      [0, 0, -1],
    ];
  }
  return null;
}

/**
 * Step 2: put the shortest of b and c second.
 * @param p - The current metric.
 * @returns The basis change, or `null`.
 */
export function step2(p: StepParameters): Matrix3 | null {
  const { B, C, eta, zeta, epsilon } = p;
  if (
    B > C + epsilon ||
    (!(Math.abs(B - C) > epsilon) && Math.abs(eta) > Math.abs(zeta) + epsilon)
  ) {
    return [
      [-1, 0, 0],
      [0, 0, -1],
      [0, -1, 0],
    ];
  }
  return null;
}

/**
 * Steps 3 and 4: make the three angles all acute or all non-acute, flipping the
 * sign of vectors.
 * @param p - The current metric.
 * @returns The basis change, or `null`.
 */
export function step3and4(p: StepParameters): Matrix3 | null {
  const l = signOf(p.xi, p.epsilon);
  const m = signOf(p.eta, p.epsilon);
  const n = signOf(p.zeta, p.epsilon);
  if (l * m * n === 1) {
    return diagonal(l === -1 ? -1 : 1, m === -1 ? -1 : 1, n === -1 ? -1 : 1);
  }
  // Step 4: all of them obtuse or right. A right angle flips whichever vector
  // keeps the determinant at +1.
  const signs = [1, 1, 1];
  let free = -1;
  const read = [l, m, n];
  for (let index = 0; index < 3; index++) {
    if (read[index] === 1) signs[index] = -1;
    else if (read[index] === 0) free = index;
  }
  if ((signs[0] ?? 1) * (signs[1] ?? 1) * (signs[2] ?? 1) === -1) {
    if (free === -1) return null;
    signs[free] = -1;
  }
  return diagonal(signs[0] ?? 1, signs[1] ?? 1, signs[2] ?? 1);
}

/**
 * Step 5: shorten c with b.
 * @param p - The current metric.
 * @returns The basis change, or `null`.
 */
export function step5(p: StepParameters): Matrix3 | null {
  const { B, xi, eta, zeta, epsilon } = p;
  if (
    Math.abs(xi) > B + epsilon ||
    (!(Math.abs(B - xi) > epsilon) && 2 * eta < zeta - epsilon) ||
    (!(Math.abs(B + xi) > epsilon) && zeta < -epsilon)
  ) {
    return [
      [1, 0, 0],
      [0, 1, -Math.sign(xi)],
      [0, 0, 1],
    ];
  }
  return null;
}

/**
 * Step 6: shorten c with a.
 * @param p - The current metric.
 * @returns The basis change, or `null`.
 */
export function step6(p: StepParameters): Matrix3 | null {
  const { A, xi, eta, zeta, epsilon } = p;
  if (
    Math.abs(eta) > A + epsilon ||
    (!(Math.abs(A - eta) > epsilon) && 2 * xi < zeta - epsilon) ||
    (!(Math.abs(A + eta) > epsilon) && zeta < -epsilon)
  ) {
    return [
      [1, 0, -Math.sign(eta)],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }
  return null;
}

/**
 * Step 7: shorten b with a.
 * @param p - The current metric.
 * @returns The basis change, or `null`.
 */
export function step7(p: StepParameters): Matrix3 | null {
  const { A, xi, eta, zeta, epsilon } = p;
  if (
    Math.abs(zeta) > A + epsilon ||
    (!(Math.abs(A - zeta) > epsilon) && 2 * xi < eta - epsilon) ||
    (!(Math.abs(A + zeta) > epsilon) && eta < -epsilon)
  ) {
    return [
      [1, -Math.sign(zeta), 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }
  return null;
}

/**
 * Step 8: replace c by a + b + c when that is shorter.
 * @param p - The current metric.
 * @returns The basis change, or `null`.
 */
export function step8(p: StepParameters): Matrix3 | null {
  const { A, B, xi, eta, zeta, epsilon } = p;
  const sum = xi + eta + zeta + A + B;
  if (
    sum < -epsilon ||
    (!(Math.abs(sum) > epsilon) && 2 * (A + eta) + zeta > epsilon)
  ) {
    return [
      [1, 0, 1],
      [0, 1, 1],
      [0, 0, 1],
    ];
  }
  return null;
}

/**
 * The sign of a number, with anything within the tolerance of zero read as
 * zero.
 * @param value - The number.
 * @param epsilon - The tolerance.
 * @returns -1, 0 or 1.
 */
function signOf(value: number, epsilon: number): number {
  if (value < -epsilon) return -1;
  if (value > epsilon) return 1;
  return 0;
}

/**
 * A diagonal matrix.
 * @param i - Its first entry.
 * @param j - Its second entry.
 * @param k - Its third entry.
 * @returns The matrix.
 */
function diagonal(i: number, j: number, k: number): Matrix3 {
  return [
    [i, 0, 0],
    [0, j, 0],
    [0, 0, k],
  ];
}
