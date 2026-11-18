import { cellToG6, g6ToCell, g6Volume } from './g6.ts';
import {
  g6OfMetric,
  identity,
  metricOfG6,
  multiply,
  transformMetric,
} from './matrix.ts';
import type { StepParameters } from './niggliSteps.ts';
import {
  step1,
  step2,
  step3and4,
  step5,
  step6,
  step7,
  step8,
} from './niggliSteps.ts';
import { primitiveCell } from './primitiveCell.ts';
import type { CellParameters, Centring, G6, Matrix3 } from './types.ts';

/**
 * How {@link niggliReduce} reads the cell it is given.
 */
export interface NiggliOptions {
  /**
   * The centring of the cell given. A centred cell is made primitive first:
   * the Niggli cell is a cell of the lattice, and only a primitive cell spans
   * it.
   * @default 'P'
   */
  centring?: Centring;
  /**
   * The tolerance of every comparison, relative to the size of the cell: it is
   * multiplied by V^(2/3), so it is read in Å² and means the same on a 3 Å
   * metal as on a 30 Å protein-salt cell. Two lengths or dot products closer
   * than this are equal for the reduction.
   * @default 1e-5
   */
  tolerance?: number;
  /**
   * How many passes the reduction may take before it is given up as not
   * converging. A real cell takes a few dozen at most.
   * @default 1000
   */
  maxIterations?: number;
}

/**
 * A Niggli-reduced cell.
 */
export interface NiggliCell {
  /**
   * The reduced cell: edges in ångström, angles in degrees.
   */
  cell: CellParameters;
  /**
   * Its G6 vector, `[A, B, C, ξ, η, ζ]` in Å².
   */
  g6: G6;
  /**
   * P such that `[a' b' c'] = [a b c] · P`, from the cell given to the reduced
   * one. Whole numbers for a primitive cell, fractions for a centred one.
   */
  transformation: Matrix3;
}

/**
 * Reduce a cell to the Niggli cell of its lattice.
 *
 * Two cells of one lattice — written in different settings, with another
 * choice of axes, or one centred and one primitive — reduce to the same Niggli
 * cell, which is what makes the reduced cell the key to compare crystals on.
 * The algorithm is Křivý and Gruber's (Acta Cryst. A32 (1976) 297–298), with
 * the tolerant comparisons of Grosse-Kunstleve, Sauter and Adams (Acta Cryst.
 * A60 (2004) 1–6).
 * @param cell - The cell, edges in ångström, angles in degrees.
 * @param options - See {@link NiggliOptions}.
 * @returns The reduced cell, its G6 vector and the basis change that made it.
 * @throws {RangeError} When the six parameters describe no cell.
 * @throws {Error} When the reduction does not converge within `maxIterations`.
 */
export function niggliReduce(
  cell: Readonly<CellParameters>,
  options: NiggliOptions = {},
): NiggliCell {
  const { centring = 'P', tolerance = 1e-5, maxIterations = 1000 } = options;
  const primitive = primitiveCell(cell, centring);
  const g6 = cellToG6(primitive.cell);
  const metric = metricOfG6(g6);
  const volume = g6Volume(g6);
  const epsilon = tolerance * Math.cbrt(volume * volume);

  let reduction = identity();
  let current = parametersOf(metric, reduction, epsilon);
  const apply = (step: Matrix3): void => {
    reduction = multiply(reduction, step);
    current = parametersOf(metric, reduction, epsilon);
  };

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const first = step1(current);
    if (first !== null) apply(first);
    const second = step2(current);
    if (second !== null) {
      apply(second);
      continue;
    }
    const signs = step3and4(current);
    if (signs !== null) apply(signs);
    const shortening =
      step5(current) ?? step6(current) ?? step7(current) ?? step8(current);
    if (shortening !== null) {
      apply(shortening);
      continue;
    }
    const reduced = g6OfMetric(transformMetric(metric, reduction));
    return {
      cell: g6ToCell(reduced),
      g6: reduced,
      transformation: multiply(primitive.transformation, reduction),
    };
  }
  throw new Error(
    `The Niggli reduction did not converge in ${maxIterations} passes.`,
  );
}

/**
 * The metric the steps read, recomputed from the starting metric at every
 * pass rather than updated, so rounding never accumulates over the passes.
 * @param metric - The metric of the primitive cell the reduction started from.
 * @param reduction - The basis change made so far.
 * @param epsilon - The tolerance, in Å².
 * @returns What the steps read.
 */
function parametersOf(
  metric: Matrix3,
  reduction: Matrix3,
  epsilon: number,
): StepParameters {
  const [A, B, C, xi, eta, zeta] = g6OfMetric(
    transformMetric(metric, reduction),
  );
  return { A, B, C, xi, eta, zeta, epsilon };
}
