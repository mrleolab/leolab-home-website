# Leo Lab Chess Room — corresponding source and licenses

This is a new Chessground + chess.js + Stockfish integration, published in October 2026. It replaces the previous ChessAnalyzer interface, whose original MIT license remains in `../LICENSE` for the retained legacy files. It is not a Lichess service and does not use Lichess accounts or servers.

The new combined chess application is distributed under **GNU GPL version 3**, without warranty. Chessground permits GPL-3.0-or-later; version 3 is selected for this distribution. Stockfish is GPL v3; chess.js is BSD-2-Clause. These terms cover the chess application and associated integration code, not an assertion that unrelated website content has been relicensed.

## Download or browse the complete source

- [Combined source archive](./leo-chess-source.tar.gz): application files, shared language integration, pinned build manifest, vendor files, corresponding dependency source, and the NNUE network.
- [Website repository](https://github.com/mrleolab/leolab-home-website/tree/main/games/international-chess)
- [Application](../chess-room.mjs), [rules integration](../game-model.mjs), [engine protocol client](../engine-client.mjs), [translations](../copy.mjs), [styles](../chess-room.css)
- [GNU GPL v3](../vendor/stockfish/COPYING.txt)

## Components and exact versions

| Component | Version / variant | License | Corresponding source |
| --- | --- | --- | --- |
| Chessground | 10.5.0, unmodified ES modules and cburnett piece artwork | GPL-3.0-or-later | [Source package](./chessground-10.5.0.tar.gz), [license](../vendor/chessground/LICENSE) |
| chess.js | 1.4.0, unmodified ES module | BSD-2-Clause | [Source package](./chess-js-1.4.0.tar.gz), [license](../vendor/chess-rules/LICENSE) |
| Stockfish.js | 19.0.1, `stockfish-19-lite-single` release build | GPL v3 | [Matching tagged source](./stockfish-19.0.1.tar.gz), [license](../vendor/stockfish/COPYING.txt) |
| Stockfish NNUE | `nn-61e7af4bb97d.nnue`, embedded by the lite build | See Stockfish source/license | [Matching network](./nn-61e7af4bb97d.nnue) |

All upstream copyright notices are retained. The board, piece artwork, chess rules, and engine are not claimed as Leo Lab originals. Only the surrounding application/interface and integration are new. Difficulty presets are search/skill settings, not claimed Elo ratings. The lite engine uses a smaller network than full Stockfish.

## Run and reproduce the application

Serve the repository root with any local static HTTP server, then open `/games/international-chess/`. No transpilation, backend, database, or paid AI API is required. The `.wasm` file must be served as `application/wasm`; the matching engine JavaScript and WASM stay in the same directory. The single-threaded engine requires no cross-origin-isolation headers.

To refresh the pinned browser libraries, run `npm ci --ignore-scripts` in `chess-app/`, then `node vendor-sync.mjs`. Both npm source packages contain the preferred TypeScript sources, licenses, and upstream package metadata. The vendor files are checked in so production deployment does not install development dependencies.

To regenerate the combined download after editing, run `node chess-app/package-source.mjs` from the repository root. Keep application files and their generated source download in the same commit. Tests run with `node --test chess-app/*.test.mjs`.

## Rebuild the engine (optional)

The browser uses unmodified release files from [Stockfish.js v19.0.1](https://github.com/nmrugg/stockfish.js/releases/tag/v19.0.1). To rebuild, extract the matching source archive, place the provided network into its `src/` directory, install the Emscripten version and pinned build dependencies specified in that archive's README/package files, then run `node build.js --lite --single-threaded --no-split`. Upstream build instructions and all C++/JavaScript glue sources are included in the tagged source. Emscripten is a separate general-purpose compiler; it is not needed to run this site.

The earlier Stockfish 16 and Next.js assets are retained for reversible rollback but are not loaded by the new page.
