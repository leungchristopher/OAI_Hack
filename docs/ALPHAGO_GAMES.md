# AlphaGo–Lee Sedol game records

The player replays all five games of the March 2016 match. [Google DeepMind](https://deepmind.google/research/alphago/) confirms AlphaGo’s 4–1 match result and identifies game 2, move 37 and game 4, move 78. The corresponding coordinates in the supplied records are Black P10 and White L11.

## Sources and processing

- Record archive: [AlphaGo Games](https://www.alphago-games.com/static/games/leesedol/leesedol.zip), linked from its [visual archive](https://www.alphago-games.com/). This is a third-party archive, not an official DeepMind download. A current first-party download of these five SGFs was not located.
- Retrieved: 2026-10-06T18:59:08.124Z.
- Original ZIP SHA-256: `74ef447ece609e65a398c5ed417a2a9bcebc034388264a6a44a8ba59432331cc`.
- The original annotated SGFs were inspected locally. Only the played main line (the first continuation at each SGF branch), players, date, result, board size, rules and komi are distributed. All commentary, analysis variations and board markup were removed.
- Each normalized SGF is downloadable from the game player. `public/alphago/games.json` also includes source URLs, original file names, original SHA-256 values, normalized SHA-256 values, and all moves. No original annotated source files are included.

## Verification

| Game | Date | Black | White | Moves | Recorded result | Captured by Black / White |
|---|---|---|---|---:|---|---|
| 1 | 2016-03-09 | Lee Sedol | AlphaGo | 186 | W+Resign | 4 / 3 |
| 2 | 2016-03-10 | AlphaGo | Lee Sedol | 211 | B+Resign | 3 / 5 |
| 3 | 2016-03-12 | Lee Sedol | AlphaGo | 176 | W+Resign | 4 / 6 |
| 4 | 2016-03-13 | AlphaGo | Lee Sedol | 180 | W+Resign | 2 / 11 |
| 5 | 2016-03-15 | Lee Sedol | AlphaGo | 280 | W+Resign | 14 / 18 |

All 1,033 played moves were replayed and checked for alternating color, bounds, occupied intersections, suicide and immediate ko. Every surviving stone group has a liberty after every move. Stone counts satisfy moves placed minus captured stones. Every normalized SGF round-trips to the same move sequence and matches its SHA-256. The record’s result is shown; the player does not recalculate final territory, perform dead-stone adjudication, or present model evaluations. It is a recorded-game player, not a general tournament-rules engine.

`npx vitest run tests/go.test.ts` — 19 tests passed, including capture groups, suicide, capture-created liberties, immediate ko, pass handling, SGF escapes/variations, all recorded moves, the two highlighted coordinates, and file hashes.

## Interface

`src/components/GoGames.tsx` exports a component with no required props. It loads the bundled JSON, validates each replay, and offers game selection, a move slider, play/pause, previous/next/start/end, move numbers, playback speed, a clickable move record, capture counters and the two highlighted jumps. No API call, pretrained model or network inference is used. Sources sit in one collapsed section.
