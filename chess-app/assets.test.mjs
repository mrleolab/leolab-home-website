import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const game=path.join(root,'games/international-chess');
test('new page loads Chessground without the legacy Next runtime',()=>{
  const html=fs.readFileSync(path.join(game,'index.html'),'utf8');
  assert.match(html,/data-native-i18n/);assert.match(html,/chess-room.mjs/);assert.doesNotMatch(html,/_next\//);
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(match[1].startsWith('http'))continue;
    let file=match[1].startsWith('/')?path.join(root,match[1]):path.join(game,match[1]);
    file=file.split('?')[0];if(file.endsWith('/'))file+='index.html';assert.ok(fs.existsSync(file),file);
  }
});
test('local Chessground module graph and engine assets are complete',()=>{
  const dir=path.join(game,'vendor/chessground');
  for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.js'))){
    const source=fs.readFileSync(path.join(dir,name),'utf8');
    for(const match of source.matchAll(/from ['"](.+?)['"]/g))assert.ok(fs.existsSync(path.resolve(dir,match[1])),match[1]);
  }
  assert.ok(fs.statSync(path.join(game,'vendor/stockfish/stockfish-19-lite-single.wasm')).size>1_000_000);
  assert.ok(fs.statSync(path.join(game,'source/leo-chess-source.tar.gz')).size<25*1024*1024);
});
test('chess page starts with the game instead of promotional introductory copy',()=>{
  const html=fs.readFileSync(path.join(game,'index.html'),'utf8');
  assert.doesNotMatch(html,/class="room-intro"|data-copy="(?:eyebrow|title|intro|local)"/);
  assert.match(html,/id="board"/);
});
