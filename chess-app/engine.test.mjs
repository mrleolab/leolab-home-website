import test from 'node:test';
import assert from 'node:assert/strict';
import {setImmediate as tick} from 'node:timers/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {EngineClient} from '../games/international-chess/engine-client.mjs';
import {GameModel} from '../games/international-chess/game-model.mjs';
class FakeWorker {
  messages=[];terminated=false;
  postMessage(message){this.messages.push(message);if(message==='uci')queueMicrotask(()=>this.emit('uciok'));if(message==='isready')queueMicrotask(()=>this.emit('readyok'));}
  emit(data){this.onmessage?.({data});}
  terminate(){this.terminated=true;}
}
test('engine handshakes, parses evaluation, and resolves one legal UCI move',async()=>{
  const worker=new FakeWorker(), engine=new EngineClient({createWorker:()=>worker});let info;
  const result=engine.search(new GameModel().chess.fen(),{skill:5,depth:8,movetime:300,onInfo:x=>info=x});await tick();
  assert.ok(worker.messages.includes('setoption name Skill Level value 5'));worker.emit('info depth 8 score cp 24 pv e2e4');worker.emit('bestmove e2e4 ponder e7e5');
  assert.equal(await result,'e2e4');assert.deepEqual(info,{depth:8,type:'cp',score:24});engine.destroy();
});
test('cancel aborts outstanding work, and stale workers cannot affect the next search',async()=>{
  const workers=[], engine=new EngineClient({createWorker:()=>{const w=new FakeWorker();workers.push(w);return w;}});
  const first=engine.search(new GameModel().chess.fen());await tick();engine.cancel();await assert.rejects(first,{name:'AbortError'});assert.equal(workers[0].terminated,true);
  const second=engine.search(new GameModel().chess.fen());await tick();workers[0].emit('bestmove a2a3');assert.ok(engine.job);workers[1].emit('bestmove d2d4');assert.equal(await second,'d2d4');engine.destroy();
});
test('cancel while initializing does not create an orphan worker',async()=>{
  let count=0;const engine=new EngineClient({createWorker:()=>{count++;return new FakeWorker();}});
  const pending=engine.search(new GameModel().chess.fen());engine.cancel();await assert.rejects(pending,{name:'AbortError'});await tick();assert.equal(count,0);engine.destroy();
});
test('a synchronous Worker failure can be retried',async()=>{
  let worker,fail=true;const engine=new EngineClient({createWorker:()=>{if(fail)throw Error('blocked');return worker=new FakeWorker();}});
  await assert.rejects(engine.ready(),/blocked/);fail=false;await engine.ready();assert.ok(worker);engine.destroy();
});
test('the actual self-hosted Stockfish binary returns a legal opening move', {timeout:15000},async()=>{
  const file=fileURLToPath(new URL('../games/international-chess/vendor/stockfish/stockfish-19-lite-single.js',import.meta.url));
  const child=spawn(process.execPath,[file],{stdio:['pipe','pipe','pipe']});
  try{
    const best=await new Promise((resolve,reject)=>{
      let output='';const timer=setTimeout(()=>reject(Error('Stockfish timed out')),12000);
      child.on('error',error=>{clearTimeout(timer);reject(error);});
      child.stdout.on('data',data=>{output+=data;const move=/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/.exec(output);if(move){clearTimeout(timer);resolve(move[1]);}});
      child.on('exit',code=>{if(code!==null&&code!==0){clearTimeout(timer);reject(Error(`Engine exited ${code}`));}});
      child.stdin.write('uci\nisready\nposition startpos\ngo depth 5\n');
    });
    const game=new GameModel();assert.doesNotThrow(()=>game.moveUci(best));
  }finally{child.kill();}
});
