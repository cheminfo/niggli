# niggli

[![NPM version](https://img.shields.io/npm/v/niggli.svg)](https://www.npmjs.com/package/niggli)
[![npm download](https://img.shields.io/npm/dm/niggli.svg)](https://www.npmjs.com/package/niggli)
[![test coverage](https://img.shields.io/codecov/c/github/cheminfo/niggli.svg)](https://codecov.io/gh/cheminfo/niggli)
[![license](https://img.shields.io/npm/l/niggli.svg)](https://github.com/cheminfo/niggli/blob/main/LICENSE)

Niggli reduction of a crystal unit cell, the G6 vector of a cell and the
distance between two.

Every lattice has one Niggli cell. Two files describing the same crystal — in
another setting, with other axes, one centred and one primitive — reduce to the
same cell, so the reduced cell is what crystals are compared and searched on.

## Installation

```console
npm install niggli
```

## Usage

```js
import { g6Distance, niggliReduce } from 'niggli';

// Face-centred cubic copper: the reduced cell is its rhombohedron of 60°.
const copper = niggliReduce(
  { a: 3.615, b: 3.615, c: 3.615, alpha: 90, beta: 90, gamma: 90 },
  { centring: 'F' },
);
// copper.cell → { a: 2.5562, b: 2.5562, c: 2.5562, alpha: 60, beta: 60, gamma: 60 }
// copper.g6 → [A, B, C, ξ, η, ζ] in Å²
// copper.transformation → P with [a' b' c'] = [a b c] · P

// Aspirin form II, written with β = 68.163° in one file and 111.627° in
// another: far apart as given, a fraction of an Å² apart once reduced.
const first = niggliReduce({
  a: 12.2696,
  b: 6.5575,
  c: 11.496,
  alpha: 90,
  beta: 68.163,
  gamma: 90,
});
const second = niggliReduce({
  a: 12.2633,
  b: 6.5624,
  c: 11.4726,
  alpha: 90,
  beta: 111.627,
  gamma: 90,
});
g6Distance(first.g6, second.g6); // small
```

| Export                                                       | What it does                                                                        |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `niggliReduce(cell, { centring, tolerance, maxIterations })` | The Niggli cell, its G6 vector and the basis change that made it                    |
| `primitiveCell(cell, centring)`                              | A primitive cell of a `A`, `B`, `C`, `I`, `F` or `R` (hexagonal axes, obverse) cell |
| `isNiggliReduced(g6, { tolerance })`                         | Whether a cell meets the Niggli conditions                                          |
| `cellToG6(cell)`, `g6ToCell(g6)`                             | `[a², b², c², 2bc cos α, 2ac cos β, 2ab cos γ]` and back                            |
| `g6Distance(first, second)`                                  | The Euclidean distance between two G6 vectors, in Å²                                |
| `cellVolume(cell)`, `g6Volume(g6)`                           | The volume in Å³                                                                    |

Edges are in ångström and angles in degrees. Comparisons are made with a
tolerance relative to the cell (`tolerance · V^(2/3)`, 1e-5 by default), so a
cell lying on a boundary of the reduced domain — cubic, hexagonal, a right
angle — reduces to one answer from any basis.

The algorithm is Křivý and Gruber's (Acta Cryst. A32 (1976) 297–298), with the
tolerant comparisons of Grosse-Kunstleve, Sauter and Adams (Acta Cryst. A60
(2004) 1–6). `g6Distance` is the plain Euclidean distance: two lattices on
either side of a boundary of the reduced domain can reduce to vectors further
apart than the lattices are, which NCDist (Andrews and Bernstein, J. Appl.
Cryst. 47 (2014) 346–359) accounts for and this does not.

## License

[MIT](./LICENSE)
