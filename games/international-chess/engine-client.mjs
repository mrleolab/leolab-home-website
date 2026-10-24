// SPDX-License-Identifier: GPL-3.0-or-later
const aborted = () => new DOMException('Search cancelled', 'AbortError');
export class EngineClient {
  constructor({createWorker = () => new Worker(new URL('./vendor/stockfish/stockfish-19-lite-single.js', import.meta.url)), timeout = 25000} = {}) {
    this.createWorker = createWorker; this.timeout = timeout; this.generation = 0; this.worker = null; this.init = null; this.job = null;
  }
  ready() {
    if (this.init) return this.init;
    const generation = this.generation;
    this.init = new Promise((resolve, reject) => {
      this.rejectInit = reject;
      this.initTimer = setTimeout(() => this.fail(new Error('Engine initialization timed out')), this.timeout);
      queueMicrotask(() => {
        if (generation !== this.generation) return;
        try {
          this.worker = this.createWorker();
          this.worker.onmessage = event => this.receive(String(event.data));
          this.worker.onerror = () => this.fail(new Error('Engine could not load'));
          this.resolveInit = resolve;
          this.worker.postMessage('uci');
        } catch (error) { this.fail(error); }
      });
    });
    // A synchronous Worker failure must remain retryable.
    return this.init;
  }
  receive(message) {
    for (const line of message.split('\n')) {
      if (line === 'uciok') {
        this.worker?.postMessage('setoption name Hash value 16');
        this.worker?.postMessage('isready');
      } else if (line === 'readyok') {
        clearTimeout(this.initTimer); this.resolveInit?.(); this.resolveInit = null; this.rejectInit = null;
      } else if (line.startsWith('info ') && this.job) {
        const depth = /\bdepth (\d+)/.exec(line), score = /\bscore (cp|mate) (-?\d+)/.exec(line);
        if (depth && score) this.job.onInfo?.({depth:Number(depth[1]), type:score[1], score:Number(score[2])});
      } else if (line.startsWith('bestmove ') && this.job) {
        const job = this.job; this.job = null; clearTimeout(job.timer); job.resolve(line.split(/\s+/)[1]);
      }
    }
  }
  async search(fen, {skill = 20, depth = 14, movetime = 1000, onInfo} = {}) {
    const version = this.generation;
    await this.ready();
    if (version !== this.generation) throw aborted();
    if (this.job) throw new Error('Engine already searching');
    return new Promise((resolve,reject) => {
      this.job = {resolve,reject,onInfo,timer:setTimeout(() => this.fail(new Error('Engine search timed out')), movetime + 15000)};
      this.worker.postMessage(`setoption name Skill Level value ${Math.max(0, Math.min(20, skill))}`);
      this.worker.postMessage('setoption name UCI_LimitStrength value false');
      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${depth} movetime ${movetime}`);
    });
  }
  fail(error) {
    clearTimeout(this.initTimer);
    this.rejectInit?.(error); this.rejectInit = null; this.resolveInit = null;
    if (this.job) { clearTimeout(this.job.timer); this.job.reject(error); this.job = null; }
    if (this.worker) { this.worker.onmessage = null; this.worker.onerror = null; this.worker.terminate(); }
    this.worker = null; this.init = null; this.generation++;
  }
  cancel() {
    if (this.job || this.rejectInit) this.fail(aborted());
    else this.generation++;
  }
  destroy() { this.fail(aborted()); }
}
