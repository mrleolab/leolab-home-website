// SPDX-License-Identifier: GPL-3.0-or-later
import { Chess } from './vendor/chess-rules/chess.mjs';

export const LEVELS = Object.freeze({
  casual: {skill: 0, depth: 4, movetime: 300},
  club: {skill: 5, depth: 9, movetime: 650},
  advanced: {skill: 12, depth: 15, movetime: 1300},
  expert: {skill: 20, depth: 20, movetime: 2200}
});
export class GameModel {
  constructor(color = 'w') { this.chess = new Chess(); this.player = color === 'b' ? 'b' : 'w'; }
  reset(color = this.player) { this.player = color === 'b' ? 'b' : 'w'; this.chess.reset(); }
  get humanTurn() { return !this.chess.isGameOver() && this.chess.turn() === this.player; }
  get aiTurn() { return !this.chess.isGameOver() && this.chess.turn() !== this.player; }
  get canUndo() { return this.chess.history().length > (this.player === 'b' ? 1 : 0); }
  destinations() {
    const dests = new Map();
    for (const move of this.chess.moves({verbose:true})) {
      if (!dests.has(move.from)) dests.set(move.from, []);
      if (!dests.get(move.from).includes(move.to)) dests.get(move.from).push(move.to);
    }
    return dests;
  }
  promotions(from, to) { return this.chess.moves({verbose:true}).filter(m => m.from === from && m.to === to && m.promotion).map(m => m.promotion); }
  move(from, to, promotion = 'q') { return this.chess.move({from, to, promotion}); }
  moveUci(uci) {
    if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) throw new Error('Invalid UCI move');
    return this.move(uci.slice(0,2), uci.slice(2,4), uci[4] || 'q');
  }
  undoTurn() {
    if (!this.canUndo) return false;
    this.chess.undo();
    if (this.chess.turn() !== this.player && this.chess.history().length) this.chess.undo();
    return true;
  }
  result() {
    const c = this.chess;
    if (c.isCheckmate()) return c.turn() === this.player ? 'lost' : 'won';
    if (c.isStalemate()) return 'stalemate';
    if (c.isThreefoldRepetition()) return 'repetition';
    if (c.isInsufficientMaterial()) return 'material';
    if (c.isDraw()) return 'draw';
    return null;
  }
}
