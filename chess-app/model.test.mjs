import test from 'node:test';
import assert from 'node:assert/strict';
import {GameModel} from '../games/international-chess/game-model.mjs';

test('legal destinations reject invalid moves without changing the position',()=>{
  const m=new GameModel(),fen=m.chess.fen();assert.deepEqual(m.destinations().get('e2'),['e3','e4']);
  assert.throws(()=>m.move('e2','e5'));assert.equal(m.chess.fen(),fen);
});
test('white player and AI turns alternate, and undo removes a complete pair',()=>{
  const m=new GameModel();m.move('e2','e4');assert.equal(m.aiTurn,true);m.moveUci('c7c5');assert.equal(m.humanTurn,true);
  assert.equal(m.undoTurn(),true);assert.equal(m.chess.history().length,0);
});
test('black player starts after the AI opening and undo preserves that opening',()=>{
  const m=new GameModel('b');assert.equal(m.aiTurn,true);m.moveUci('e2e4');assert.equal(m.canUndo,false);
  m.move('c7','c5');m.moveUci('g1f3');m.undoTurn();assert.deepEqual(m.chess.history(),['e4']);assert.equal(m.humanTurn,true);
});
test('undo during an AI turn removes only the unanswered human move',()=>{
  const m=new GameModel();m.move('e2','e4');m.undoTurn();assert.equal(m.humanTurn,true);assert.equal(m.chess.history().length,0);
});
test('castling moves the rook according to the rules',()=>{
  const m=new GameModel();m.chess.load('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');m.move('e1','g1');
  assert.equal(m.chess.get('f1').type,'r');assert.equal(m.chess.get('g1').type,'k');assert.equal(m.chess.get('h1'),undefined);
});
test('en passant removes the captured pawn',()=>{
  const m=new GameModel();m.chess.load('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');m.move('e5','d6');assert.equal(m.chess.get('d5'),undefined);assert.equal(m.chess.get('d6').type,'p');
});
test('promotion supports all four choices including underpromotion',()=>{
  const m=new GameModel();m.chess.load('7k/P7/8/8/8/8/8/7K w - - 0 1');assert.deepEqual(new Set(m.promotions('a7','a8')),new Set(['q','r','b','n']));
  m.moveUci('a7a8n');assert.equal(m.chess.get('a8').type,'n');
});
test('checkmate and stalemate produce distinct results',()=>{
  const m=new GameModel();for(const move of ['f3','e5','g4','Qh4#'])m.chess.move(move);assert.equal(m.result(),'lost');
  m.chess.load('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');assert.equal(m.result(),'stalemate');
});
test('threefold repetition is detected',()=>{
  const m=new GameModel();for(const move of ['Nf3','Nf6','Ng1','Ng8','Nf3','Nf6','Ng1','Ng8'])m.chess.move(move);assert.equal(m.result(),'repetition');
});
