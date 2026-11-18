import type { G6, Matrix3 } from './types.ts';

/**
 * The 3 × 3 identity.
 * @returns A new identity matrix.
 */
export function identity(): Matrix3 {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
}

/**
 * The product `left · right`.
 * @param left - The matrix on the left.
 * @param right - The matrix on the right.
 * @returns A new matrix.
 */
export function multiply(left: Matrix3, right: Matrix3): Matrix3 {
  const [[l00, l01, l02], [l10, l11, l12], [l20, l21, l22]] = left;
  const [[r00, r01, r02], [r10, r11, r12], [r20, r21, r22]] = right;
  return [
    [
      l00 * r00 + l01 * r10 + l02 * r20,
      l00 * r01 + l01 * r11 + l02 * r21,
      l00 * r02 + l01 * r12 + l02 * r22,
    ],
    [
      l10 * r00 + l11 * r10 + l12 * r20,
      l10 * r01 + l11 * r11 + l12 * r21,
      l10 * r02 + l11 * r12 + l12 * r22,
    ],
    [
      l20 * r00 + l21 * r10 + l22 * r20,
      l20 * r01 + l21 * r11 + l22 * r21,
      l20 * r02 + l21 * r12 + l22 * r22,
    ],
  ];
}

/**
 * The transpose of a matrix.
 * @param matrix - The matrix.
 * @returns A new matrix.
 */
export function transpose(matrix: Matrix3): Matrix3 {
  const [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]] = matrix;
  return [
    [m00, m10, m20],
    [m01, m11, m21],
    [m02, m12, m22],
  ];
}

/**
 * The metric of the basis `[a b c] · P`, from the metric of `[a b c]`:
 * `Pᵀ · G · P`.
 * @param metric - The metric tensor G.
 * @param transformation - P, whose columns are the new vectors in the old basis.
 * @returns A new metric tensor.
 */
export function transformMetric(
  metric: Matrix3,
  transformation: Matrix3,
): Matrix3 {
  return multiply(transpose(transformation), multiply(metric, transformation));
}

/**
 * The determinant of a 3 × 3 matrix.
 * @param matrix - The matrix.
 * @returns Its determinant.
 */
export function determinant(matrix: Matrix3): number {
  const [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]] = matrix;
  return (
    m00 * (m11 * m22 - m12 * m21) -
    m01 * (m10 * m22 - m12 * m20) +
    m02 * (m10 * m21 - m11 * m20)
  );
}

/**
 * The metric tensor of a G6 vector.
 * @param g6 - `[A, B, C, ξ, η, ζ]`.
 * @returns The symmetric matrix of the dot products of a, b and c.
 */
export function metricOfG6(g6: Readonly<G6>): Matrix3 {
  const [A, B, C, xi, eta, zeta] = g6;
  return [
    [A, zeta / 2, eta / 2],
    [zeta / 2, B, xi / 2],
    [eta / 2, xi / 2, C],
  ];
}

/**
 * The G6 vector of a metric tensor.
 * @param metric - The symmetric matrix of the dot products of a, b and c.
 * @returns `[A, B, C, ξ, η, ζ]`.
 */
export function g6OfMetric(metric: Matrix3): G6 {
  const [[A, ab], [, B, bc], [ac, , C]] = metric;
  return [A, B, C, 2 * bc, 2 * ac, 2 * ab];
}
