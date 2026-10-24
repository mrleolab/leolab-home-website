// SPDX-License-Identifier: GPL-3.0-or-later
import {mkdir,readdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const base=path.dirname(fileURLToPath(import.meta.url));
const output=path.resolve(base,'../games/international-chess/vendor');
const cg=path.join(base,'node_modules/@lichess-org/chessground');
await mkdir(path.join(output,'chessground'),{recursive:true});
await mkdir(path.join(output,'chess-rules'),{recursive:true});
for(const name of await readdir(path.join(cg,'dist')))if(name.endsWith('.js'))await copyFile(path.join(cg,'dist',name),path.join(output,'chessground',name));
for(const name of await readdir(path.join(cg,'assets')))if(name.endsWith('.css'))await copyFile(path.join(cg,'assets',name),path.join(output,'chessground',name));
await copyFile(path.join(cg,'LICENSE'),path.join(output,'chessground/LICENSE'));
await copyFile(path.join(base,'node_modules/chess.js/dist/esm/chess.js'),path.join(output,'chess-rules/chess.mjs'));
await copyFile(path.join(base,'node_modules/chess.js/LICENSE'),path.join(output,'chess-rules/LICENSE'));
console.log('Pinned browser libraries refreshed.');
