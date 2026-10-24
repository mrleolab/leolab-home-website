// SPDX-License-Identifier: GPL-3.0-or-later
import { Chessground } from './vendor/chessground/chessground.js';
import { GameModel, LEVELS } from './game-model.mjs';
import { EngineClient } from './engine-client.mjs';
import { text } from './copy.mjs';

const $ = id => document.getElementById(id);
const locale = () => window.LeoI18n?.locale || 'en';
const t = key => text(key, locale());
const model = new GameModel();
const engine = new EngineClient();
let epoch = 0, busy = null, engineState = 'loading', notice = null, hintMove = null, evaluation = null, pendingPromotion = null;
let activeLevel = 'club', orientation = 'white', moveCount = -1;
const ground = Chessground($('board'), {
  fen:model.chess.fen(), orientation, turnColor:'white',
  coordinates:true, coordinatesOnSquares:false, autoCastle:true,
  blockTouchScroll:false, draggable:{enabled:true, distance:6, showGhost:true},
  selectable:{enabled:true}, premovable:{enabled:false},
  animation:{enabled:!matchMedia('(prefers-reduced-motion: reduce)').matches, duration:180},
  movable:{free:false, color:'white', dests:model.destinations(), showDests:true, events:{after:onHumanMove}},
  drawable:{enabled:false, visible:true}
});
function set(id,value) { const el=$(id); if (el.textContent !== value) el.textContent=value; }
function invalidate() { epoch++; engine.cancel(); busy=null; hintMove=null; evaluation=null; notice=null; ground.setAutoShapes([]); }
function renderBoard() {
  const history=model.chess.history({verbose:true}), last=history.at(-1);
  ground.set({fen:model.chess.fen(), orientation, turnColor:model.chess.turn()==='w'?'white':'black',
    check:model.chess.isCheck(), lastMove:last?[last.from,last.to]:undefined,
    movable:{free:false, color:model.humanTurn&&!pendingPromotion?(model.player==='w'?'white':'black'):undefined,
      dests:model.humanTurn&&!pendingPromotion?model.destinations():new Map()}});
  if (hintMove) ground.setAutoShapes([{orig:hintMove.slice(0,2),dest:hintMove.slice(2,4),brush:'green'}]);
}
function renderMoves() {
  const history=model.chess.history();
  if (moveCount===history.length) return;
  moveCount=history.length; $('moves').replaceChildren();
  for(let i=0;i<history.length;i+=2){
    const li=document.createElement('li');
    for(const value of [`${i/2+1}.`,history[i],history[i+1]||'…']){const span=document.createElement('span');span.textContent=value;li.append(span);}
    $('moves').append(li);
  }
  $('empty-moves').hidden=history.length>0;
}
function statusKey() {
  return model.result() || (engineState==='error'?'engineError':busy==='hint'?'hintThinking':model.aiTurn?'thinking':model.chess.isCheck()?'inCheck':'yourTurn');
}
function render() {
  const topColor=orientation==='white'?'b':'w', bottomColor=topColor==='b'?'w':'b';
  for(const [where,color] of [['top',topColor],['bottom',bottomColor]]){
    const human=color===model.player;
    set(`${where}-name`,human?t('you'):t('computer'));
    set(`${where}-meta`,t(color==='w'?'white':'black')+(human?'':` · ${t(activeLevel)}`));
    set(`${where}-icon`,color==='w'?'♔':'♚');
  }
  set('engine-state',t(engineState==='ready'?'ready':engineState==='error'?'engineError':'loading'));
  set('turn-label',t(model.result() || (model.humanTurn?'yourTurn':'thinking')));
  let message=t(statusKey());
  if(notice==='hint'&&hintMove)message=`${t('hintPrefix')} ${hintMove.slice(0,2)} → ${hintMove.slice(2,4)}${hintMove[4]?` (${hintMove[4].toUpperCase()})`:''}`;
  else if(notice && notice!=='hint')message=t(notice);
  set('game-status',message);
  $('retry').hidden=engineState!=='error';
  $('undo').disabled=!model.canUndo || !!pendingPromotion;
  $('hint').disabled=!model.humanTurn || !!busy || !!pendingPromotion || engineState==='error';
  $('coordinate-submit').disabled=!model.humanTurn || !!pendingPromotion;
  if(evaluation){
    set('evaluation',evaluation.type==='mate'?`${evaluation.score<0?'−':''}M${Math.abs(evaluation.score)}`:`${evaluation.score>=0?'+':''}${(evaluation.score/100).toFixed(2)}`);
    set('search-depth',`${t('depth')}: ${evaluation.depth}`);
  }else{set('evaluation','—');set('search-depth',t('noEval'));}
  renderMoves();
}
function updateCopy() {
  document.querySelectorAll('[data-copy]').forEach(el=>{el.textContent=t(el.dataset.copy);});
  $('board').setAttribute('aria-label',t('playLabel'));
  $('moves').setAttribute('aria-label',t('tools'));
  document.title=`${locale()==='zh-CN'?'国际象棋':'International Chess'} — Leo Lab`;
  render();
}
async function warmEngine() {
  const version=epoch;
  engineState='loading';render();
  try {await engine.ready();if(version===epoch){engineState='ready';render();}}
  catch(error){if(version===epoch&&error.name!=='AbortError'){engineState='error';render();}}
}
async function ask(kind) {
  if(pendingPromotion || model.result() || (kind==='ai'?!model.aiTurn:!model.humanTurn))return;
  const version=epoch, fen=model.chess.fen(), sign=model.chess.turn()==='w'?1:-1;
  busy=kind;notice=null;render();
  try{
    const move=await engine.search(fen,{...(kind==='hint'?{skill:20,depth:16,movetime:1100}:LEVELS[activeLevel]),onInfo:info=>{
      if(version!==epoch||model.chess.fen()!==fen)return;
      engineState='ready';evaluation={...info,score:info.score*sign};render();
    }});
    if(version!==epoch||model.chess.fen()!==fen)return;
    busy=null;engineState='ready';
    if(kind==='ai'){
      model.moveUci(move);hintMove=null;ground.setAutoShapes([]);renderBoard();
    }else{
      // Validate the hint against the same rules used to play the game.
      const legal=model.chess.moves({verbose:true}).some(m=>m.from+m.to+(m.promotion||'')===move);
      if(!legal)throw new Error('Engine returned an illegal hint');
      hintMove=move;notice='hint';renderBoard();
    }
    render();
  }catch(error){
    if(version!==epoch||error.name==='AbortError')return;
    busy=null;engineState='error';notice='engineError';renderBoard();render();
  }
}
function commitHuman(from,to,promotion='q') {
  if(!model.humanTurn)return;
  try{
    // Validate before cancelling anything, so invalid coordinate input is harmless.
    if(!model.chess.moves({verbose:true}).some(m=>m.from===from&&m.to===to&&(!m.promotion||m.promotion===promotion)))throw new Error('Illegal move');
    invalidate();model.move(from,to,promotion);$('fen-output').hidden=true;renderBoard();render();
    if(model.aiTurn)void ask('ai');
  }catch{notice='invalid';renderBoard();render();}
}
function onHumanMove(from,to) {
  if(!model.humanTurn){renderBoard();return;}
  if(model.promotions(from,to).length){
    pendingPromotion={from,to};renderBoard();render();$('promotion-dialog').showModal();
  }else commitHuman(from,to);
}
$('new-game').addEventListener('click',()=>{
  if(model.chess.history().length&&!window.confirm(t('restart')))return;
  invalidate();pendingPromotion=null;if($('promotion-dialog').open)$('promotion-dialog').close();
  model.reset(document.querySelector('input[name="player-color"]:checked').value);
  activeLevel=Object.hasOwn(LEVELS,$('difficulty').value)?$('difficulty').value:'club';
  orientation=model.player==='w'?'white':'black';moveCount=-1;$('fen-output').hidden=true;
  renderBoard();render();if(model.aiTurn)void ask('ai');else void warmEngine();
});
$('undo').addEventListener('click',()=>{if(!model.canUndo)return;invalidate();model.undoTurn();moveCount=-1;renderBoard();render();void warmEngine();});
$('flip').addEventListener('click',()=>{orientation=orientation==='white'?'black':'white';renderBoard();render();});
$('hint').addEventListener('click',()=>{if(model.humanTurn&&!busy){invalidate();void ask('hint');}});
$('retry').addEventListener('click',()=>{invalidate();engine.destroy();engineState='loading';if(model.aiTurn)void ask('ai');else void warmEngine();});
$('coordinate-form').addEventListener('submit',event=>{
  event.preventDefault();const input=$('coordinate-move'),uci=input.value.trim().toLowerCase();
  if(!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)||!model.humanTurn){notice='invalid';render();return;}
  if(model.promotions(uci.slice(0,2),uci.slice(2,4)).length&&!uci[4])onHumanMove(uci.slice(0,2),uci.slice(2,4));
  else commitHuman(uci.slice(0,2),uci.slice(2,4),uci[4]||'q');
  input.value='';
});
document.querySelectorAll('[data-promotion]').forEach(button=>button.addEventListener('click',()=>{
  const pending=pendingPromotion;pendingPromotion=null;$('promotion-dialog').close();
  if(pending)commitHuman(pending.from,pending.to,button.dataset.promotion);
}));
function cancelPromotion(){pendingPromotion=null;$('promotion-dialog').close();renderBoard();render();}
$('cancel-promotion').addEventListener('click',cancelPromotion);
$('promotion-dialog').addEventListener('cancel',event=>{event.preventDefault();cancelPromotion();});
$('export').addEventListener('click',()=>{
  const game=model.chess, date=new Date().toISOString().slice(0,10).replaceAll('-','.');
  game.header('Event','Leo Lab · Stockfish','Date',date,'White',model.player==='w'?'Player':'Stockfish 19','Black',model.player==='b'?'Player':'Stockfish 19');
  const url=URL.createObjectURL(new Blob([game.pgn()||'[Event "Leo Lab"]\n\n*'],{type:'application/x-chess-pgn'}));
  const link=document.createElement('a');link.href=url;link.download='leo-lab-chess.pgn';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('copy-fen').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(model.chess.fen());notice='copied';}
  catch{notice='copyError';set('fen-output',model.chess.fen());$('fen-output').hidden=false;}
  render();
});
window.addEventListener('leo-language-change',updateCopy);
window.addEventListener('pagehide',()=>engine.destroy());
updateCopy();renderBoard();void warmEngine();
