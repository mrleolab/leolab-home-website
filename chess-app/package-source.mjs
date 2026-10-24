// SPDX-License-Identifier: GPL-3.0-or-later
import {mkdtemp,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const game='games/international-chess';
const dir=await mkdtemp(path.join(tmpdir(),'leo-chess-source-'));
const files=['index.html','chess-room.mjs','chess-room.css','game-model.mjs','engine-client.mjs','copy.mjs','vendor',
  'source/README.md','source/chessground-10.5.0.tar.gz','source/chess-js-1.4.0.tar.gz','source/stockfish-19.0.1.tar.gz','source/nn-61e7af4bb97d.nnue'].map(f=>`${game}/${f}`);
files.push('chess-app/package.json','chess-app/package-lock.json','chess-app/vendor-sync.mjs','chess-app/package-source.mjs','chess-app/model.test.mjs','chess-app/engine.test.mjs','chess-app/assets.test.mjs','site-language.js','site-language.css','site-language-strings.js');
execFileSync('tar',['-czf',path.join(dir,'leo-chess-source.tar.gz'),...files],{cwd:root});
await copyFile(path.join(dir,'leo-chess-source.tar.gz'),path.join(root,game,'source/leo-chess-source.tar.gz'));
console.log('Combined corresponding source archive refreshed.');
